using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Data;
using Microsoft.EntityFrameworkCore;

namespace EVDataMarketplace.API.Services;

public class CsvParserService : ICsvParserService
{
    private readonly EVDataMarketplaceDbContext _context;

    public CsvParserService(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<(bool success, string message, List<DatasetRecord> records)> ParseAndValidateCsvAsync(
        Stream fileStream,
        int datasetId,
        string providerName)
    {
        var records = new List<DatasetRecord>();
        var errors = new List<string>();

        try
        {
            using var reader = new StreamReader(fileStream, Encoding.UTF8);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null
            };

            using var csv = new CsvReader(reader, config);

            // Read header
            await csv.ReadAsync();
            csv.ReadHeader();

            // Validate required columns
            var requiredColumns = new[]
            {
                "StationId", "StationName", "ProvinceId", "DistrictId",
                "ChargingTimestamp", "EnergyKwh"
            };

            foreach (var column in requiredColumns)
            {
                if (!csv.HeaderRecord.Contains(column))
                {
                    errors.Add($"Missing required column: {column}");
                }
            }

            if (errors.Any())
            {
                return (false, string.Join("; ", errors), records);
            }

            // Load valid province and district IDs for validation
            var validProvinceIds = await _context.Provinces.Select(p => p.ProvinceId).ToListAsync();
            var validDistrictIds = await _context.Districts.Select(d => d.DistrictId).ToListAsync();

            int rowNumber = 1;

            while (await csv.ReadAsync())
            {
                rowNumber++;

                try
                {
                    var stationId = csv.GetField<string>("StationId");
                    var stationName = csv.GetField<string>("StationName");
                    var provinceId = csv.GetField<int>("ProvinceId");
                    var districtId = csv.GetField<int>("DistrictId");
                    var chargingTimestamp = csv.GetField<DateTime>("ChargingTimestamp");
                    var energyKwh = csv.GetField<decimal>("EnergyKwh");

                    // Validation
                    if (string.IsNullOrWhiteSpace(stationId))
                    {
                        errors.Add($"Row {rowNumber}: StationId is required");
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(stationName))
                    {
                        errors.Add($"Row {rowNumber}: StationName is required");
                        continue;
                    }

                    if (!validProvinceIds.Contains(provinceId))
                    {
                        errors.Add($"Row {rowNumber}: Invalid ProvinceId {provinceId}");
                        continue;
                    }

                    if (!validDistrictIds.Contains(districtId))
                    {
                        errors.Add($"Row {rowNumber}: Invalid DistrictId {districtId}");
                        continue;
                    }

                    if (energyKwh <= 0)
                    {
                        errors.Add($"Row {rowNumber}: EnergyKwh must be positive");
                        continue;
                    }

                    // Create record
                    var record = new DatasetRecord
                    {
                        DatasetId = datasetId,
                        StationId = stationId,
                        StationName = stationName,
                        StationAddress = csv.GetField<string>("StationAddress"),
                        StationOperator = csv.GetField<string>("StationOperator"),
                        ProvinceId = provinceId,
                        DistrictId = districtId,
                        ChargingTimestamp = chargingTimestamp,
                        EnergyKwh = energyKwh,
                        Voltage = csv.GetField<decimal?>("Voltage"),
                        Current = csv.GetField<decimal?>("Current"),
                        PowerKw = csv.GetField<decimal?>("PowerKw"),
                        DurationMinutes = csv.GetField<decimal?>("DurationMinutes"),
                        ChargingCost = csv.GetField<decimal?>("ChargingCost"),
                        VehicleType = csv.GetField<string>("VehicleType"),
                        BatteryCapacityKwh = csv.GetField<decimal?>("BatteryCapacityKwh"),
                        SocStart = csv.GetField<decimal?>("SocStart"),
                        SocEnd = csv.GetField<decimal?>("SocEnd"),
                        DataSource = providerName,
                        CreatedAt = DateTime.Now
                    };

                    records.Add(record);
                }
                catch (Exception ex)
                {
                    errors.Add($"Row {rowNumber}: {ex.Message}");
                }
            }

            if (errors.Count > 10)
            {
                return (false, $"Too many errors ({errors.Count}). First 10: {string.Join("; ", errors.Take(10))}", records);
            }

            if (errors.Any())
            {
                return (false, string.Join("; ", errors), records);
            }

            if (!records.Any())
            {
                return (false, "No valid data rows found", records);
            }

            return (true, $"Successfully parsed {records.Count} records", records);
        }
        catch (Exception ex)
        {
            return (false, $"Failed to parse CSV: {ex.Message}", records);
        }
    }

    public byte[] GenerateCsvTemplate()
    {
        var sb = new StringBuilder();

        // Header
        sb.AppendLine("StationId,StationName,StationAddress,StationOperator,ProvinceId,DistrictId,ChargingTimestamp,EnergyKwh,Voltage,Current,PowerKw,DurationMinutes,ChargingCost,VehicleType,BatteryCapacityKwh,SocStart,SocEnd");

        // Sample row with example data
        sb.AppendLine("STATION_001,VinFast Charging Station 1,123 Main St,VinFast,1,1,2024-01-01 08:00:00,45.5,220,32.5,7.2,60,50000,VF8,82.5,20.0,90.0");
        sb.AppendLine("STATION_002,VinFast Charging Station 2,456 Second Ave,VinFast,1,5,2024-01-01 09:30:00,38.2,220,28.0,6.5,45,42000,VF9,87.3,30.0,80.0");

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
