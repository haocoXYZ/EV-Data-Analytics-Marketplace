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

    /// <summary>
    /// Normalize Vietnamese text for case-insensitive, diacritic-insensitive comparison
    /// </summary>
    private static string NormalizeName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        // Convert to lowercase and remove diacritics
        var normalized = name.ToLowerInvariant().Trim();

        // Remove common variations
        normalized = normalized
            .Replace("tp.", "")
            .Replace("thành phố", "")
            .Replace("tỉnh", "")
            .Replace("quận", "")
            .Replace("huyện", "")
            .Replace("  ", " ")
            .Trim();

        // Remove diacritics
        var withoutDiacritics = RemoveDiacritics(normalized);

        return withoutDiacritics;
    }

    /// <summary>
    /// Remove Vietnamese diacritics
    /// </summary>
    private static string RemoveDiacritics(string text)
    {
        var diacriticMap = new Dictionary<char, char>
        {
            {'á', 'a'}, {'à', 'a'}, {'ả', 'a'}, {'ã', 'a'}, {'ạ', 'a'},
            {'ă', 'a'}, {'ắ', 'a'}, {'ằ', 'a'}, {'ẳ', 'a'}, {'ẵ', 'a'}, {'ặ', 'a'},
            {'â', 'a'}, {'ấ', 'a'}, {'ầ', 'a'}, {'ẩ', 'a'}, {'ẫ', 'a'}, {'ậ', 'a'},
            {'é', 'e'}, {'è', 'e'}, {'ẻ', 'e'}, {'ẽ', 'e'}, {'ẹ', 'e'},
            {'ê', 'e'}, {'ế', 'e'}, {'ề', 'e'}, {'ể', 'e'}, {'ễ', 'e'}, {'ệ', 'e'},
            {'í', 'i'}, {'ì', 'i'}, {'ỉ', 'i'}, {'ĩ', 'i'}, {'ị', 'i'},
            {'ó', 'o'}, {'ò', 'o'}, {'ỏ', 'o'}, {'õ', 'o'}, {'ọ', 'o'},
            {'ô', 'o'}, {'ố', 'o'}, {'ồ', 'o'}, {'ổ', 'o'}, {'ỗ', 'o'}, {'ộ', 'o'},
            {'ơ', 'o'}, {'ớ', 'o'}, {'ờ', 'o'}, {'ở', 'o'}, {'ỡ', 'o'}, {'ợ', 'o'},
            {'ú', 'u'}, {'ù', 'u'}, {'ủ', 'u'}, {'ũ', 'u'}, {'ụ', 'u'},
            {'ư', 'u'}, {'ứ', 'u'}, {'ừ', 'u'}, {'ử', 'u'}, {'ữ', 'u'}, {'ự', 'u'},
            {'ý', 'y'}, {'ỳ', 'y'}, {'ỷ', 'y'}, {'ỹ', 'y'}, {'ỵ', 'y'},
            {'đ', 'd'}
        };

        var result = new System.Text.StringBuilder();
        foreach (var c in text)
        {
            result.Append(diacriticMap.ContainsKey(c) ? diacriticMap[c] : c);
        }

        return result.ToString();
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

            // Validate required columns - support both ID and Name formats
            var requiredColumns = new[]
            {
                "StationId", "StationName", "ChargingTimestamp", "EnergyKwh"
            };

            foreach (var column in requiredColumns)
            {
                if (!csv.HeaderRecord.Contains(column))
                {
                    errors.Add($"Missing required column: {column}");
                }
            }

            // Check if using ID format or Name format for location
            var hasProvinceId = csv.HeaderRecord.Contains("ProvinceId");
            var hasProvinceName = csv.HeaderRecord.Contains("Province");
            var hasDistrictId = csv.HeaderRecord.Contains("DistrictId");
            var hasDistrictName = csv.HeaderRecord.Contains("District");

            if (!hasProvinceId && !hasProvinceName)
            {
                errors.Add("Missing required column: Either 'ProvinceId' or 'Province' is required");
            }

            if (!hasDistrictId && !hasDistrictName)
            {
                errors.Add("Missing required column: Either 'DistrictId' or 'District' is required");
            }

            if (errors.Any())
            {
                return (false, string.Join("; ", errors), records);
            }

            // Load provinces and districts for lookup
            var provinces = await _context.Provinces.ToListAsync();
            var districts = await _context.Districts.ToListAsync();

            // Create lookup dictionaries (case-insensitive, diacritic-insensitive)
            var provinceByName = provinces.ToDictionary(
                p => NormalizeName(p.Name),
                p => p.ProvinceId
            );
            var districtByName = districts.ToDictionary(
                d => NormalizeName(d.Name),
                d => d
            );

            int rowNumber = 1;

            while (await csv.ReadAsync())
            {
                rowNumber++;

                try
                {
                    var stationId = csv.GetField<string>("StationId");
                    var stationName = csv.GetField<string>("StationName");
                    var chargingTimestamp = csv.GetField<DateTime>("ChargingTimestamp");
                    var energyKwh = csv.GetField<decimal>("EnergyKwh");

                    // Parse Province (support both ID and Name)
                    int provinceId;
                    if (hasProvinceId)
                    {
                        provinceId = csv.GetField<int>("ProvinceId");
                        if (!provinces.Any(p => p.ProvinceId == provinceId))
                        {
                            errors.Add($"Row {rowNumber}: Invalid ProvinceId {provinceId}");
                            continue;
                        }
                    }
                    else
                    {
                        var provinceName = csv.GetField<string>("Province");
                        var normalizedProvince = NormalizeName(provinceName);

                        if (!provinceByName.TryGetValue(normalizedProvince, out provinceId))
                        {
                            errors.Add($"Row {rowNumber}: Province '{provinceName}' not found. Please check spelling or use ProvinceId instead.");
                            continue;
                        }
                    }

                    // Parse District (support both ID and Name)
                    int districtId;
                    if (hasDistrictId)
                    {
                        districtId = csv.GetField<int>("DistrictId");
                        if (!districts.Any(d => d.DistrictId == districtId))
                        {
                            errors.Add($"Row {rowNumber}: Invalid DistrictId {districtId}");
                            continue;
                        }
                    }
                    else
                    {
                        var districtName = csv.GetField<string>("District");
                        var normalizedDistrict = NormalizeName(districtName);

                        // Find district in the province
                        var matchedDistrict = districtByName
                            .Where(kvp => kvp.Value.ProvinceId == provinceId && kvp.Key == normalizedDistrict)
                            .Select(kvp => kvp.Value)
                            .FirstOrDefault();

                        if (matchedDistrict == null)
                        {
                            errors.Add($"Row {rowNumber}: District '{districtName}' not found in the selected province. Please check spelling or use DistrictId instead.");
                            continue;
                        }

                        districtId = matchedDistrict.DistrictId;
                    }

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

        // Add UTF-8 BOM for Excel compatibility
        sb.Append('\ufeff');

        // Instructions (commented lines starting with #)
        sb.AppendLine("# ========================================");
        sb.AppendLine("# HƯỚNG DẪN SỬ DỤNG TEMPLATE CSV");
        sb.AppendLine("# ========================================");
        sb.AppendLine("#");
        sb.AppendLine("# 1. Điền dữ liệu vào các cột bên dưới");
        sb.AppendLine("# 2. Các cột bắt buộc: StationId, StationName, Province, District, ChargingTimestamp, EnergyKwh");
        sb.AppendLine("#");
        sb.AppendLine("# 3. CỘT PROVINCE VÀ DISTRICT:");
        sb.AppendLine("#    - Bạn có thể nhập TÊN trực tiếp (khuyến nghị):");
        sb.AppendLine("#      Province: Hà Nội, TP.Hồ Chí Minh, Đà Nẵng, Hải Phòng, ...");
        sb.AppendLine("#      District: Ba Đình, Quận 1, Hải Châu, Hồng Bàng, ...");
        sb.AppendLine("#");
        sb.AppendLine("#    - Hoặc dùng ID (cách cũ, khó hơn):");
        sb.AppendLine("#      Thay 'Province' → 'ProvinceId', 'District' → 'DistrictId'");
        sb.AppendLine("#      ProvinceId: 1=Hà Nội, 79=TP.HCM, 48=Đà Nẵng");
        sb.AppendLine("#");
        sb.AppendLine("# 4. Hệ thống TỰ ĐỘNG nhận diện cả TÊN và ID");
        sb.AppendLine("#    - Không phân biệt hoa/thường: 'Hà Nội' = 'HÀ NỘI' = 'hà nội'");
        sb.AppendLine("#    - Không cần dấu chính xác: 'Ha Noi' cũng được nhận diện");
        sb.AppendLine("#    - Bỏ qua 'Tỉnh', 'TP.', 'Quận': 'TP.Hồ Chí Minh' = 'Hồ Chí Minh' = 'HCM'");
        sb.AppendLine("#");
        sb.AppendLine("# 5. Format ngày giờ: yyyy-MM-dd HH:mm:ss (ví dụ: 2024-01-01 08:00:00)");
        sb.AppendLine("#");
        sb.AppendLine("# 6. Xóa TẤT CẢ các dòng comment (bắt đầu bằng #) trước khi upload");
        sb.AppendLine("#");
        sb.AppendLine("# ========================================");
        sb.AppendLine();

        // Header - SỬ DỤNG TÊN thay vì ID
        sb.AppendLine("StationId,StationName,StationAddress,StationOperator,Province,District,ChargingTimestamp,EnergyKwh,Voltage,Current,PowerKw,DurationMinutes,ChargingCost,VehicleType,BatteryCapacityKwh,SocStart,SocEnd");

        // Sample rows với TÊN tỉnh/quận (dễ hiểu hơn)
        sb.AppendLine("STATION_001,Trạm Sạc VinFast Láng Hạ,123 Đường Láng,VinFast,Hà Nội,Ba Đình,2024-01-01 08:00:00,45.5,220,32.5,7.2,60,50000,VF8,82.5,20.0,90.0");
        sb.AppendLine("STATION_002,Trạm Sạc VinFast Long Biên,456 Phố Ngọc Lâm,VinFast,Hà Nội,Long Biên,2024-01-01 09:30:00,38.2,220,28.0,6.5,45,42000,VF9,87.3,30.0,80.0");
        sb.AppendLine("STATION_003,Trạm Sạc Saigon Centre,789 Nguyễn Huệ,VinFast,TP.Hồ Chí Minh,Quận 1,2024-01-01 10:15:00,52.3,220,35.0,8.0,75,65000,VF8,82.5,15.0,85.0");
        sb.AppendLine("STATION_004,Trạm Sạc Đà Nẵng Beach,101 Võ Nguyên Giáp,VinFast,Đà Nẵng,Sơn Trà,2024-01-01 11:00:00,41.8,220,30.2,6.8,55,48000,VF9,87.3,25.0,85.0");

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
