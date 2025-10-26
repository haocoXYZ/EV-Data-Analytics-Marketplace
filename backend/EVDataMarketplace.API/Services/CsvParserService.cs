using System.Globalization;
using System.Text;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;

namespace EVDataMarketplace.API.Services;

public interface ICsvParserService
{
    Task<List<Dictionary<string, object>>> ParseCsvAsync(Stream csvStream);
    Task<(int rowCount, List<string> columns)> GetCsvInfoAsync(Stream csvStream);
}

public class CsvParserService : ICsvParserService
{
    private readonly ILogger<CsvParserService> _logger;

    public CsvParserService(ILogger<CsvParserService> logger)
    {
        _logger = logger;
    }

    public async Task<List<Dictionary<string, object>>> ParseCsvAsync(Stream csvStream)
    {
        var records = new List<Dictionary<string, object>>();

        try
        {
            using var reader = new StreamReader(csvStream, Encoding.UTF8);
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
            var headers = csv.HeaderRecord;

            if (headers == null || headers.Length == 0)
            {
                throw new InvalidDataException("CSV file has no headers");
            }

            // Read all records
            while (await csv.ReadAsync())
            {
                var record = new Dictionary<string, object>();

                foreach (var header in headers)
                {
                    var value = csv.GetField(header);
                    record[header] = value ?? string.Empty;
                }

                records.Add(record);
            }

            _logger.LogInformation("Parsed {Count} records from CSV", records.Count);
            return records;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing CSV file");
            throw new InvalidDataException("Failed to parse CSV file: " + ex.Message);
        }
    }

    public async Task<(int rowCount, List<string> columns)> GetCsvInfoAsync(Stream csvStream)
    {
        try
        {
            csvStream.Position = 0; // Reset stream

            using var reader = new StreamReader(csvStream, Encoding.UTF8, leaveOpen: true);
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
            var headers = csv.HeaderRecord?.ToList() ?? new List<string>();

            // Count rows
            int rowCount = 0;
            while (await csv.ReadAsync())
            {
                rowCount++;
            }

            csvStream.Position = 0; // Reset for next use
            return (rowCount, headers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading CSV info");
            throw new InvalidDataException("Failed to read CSV file info: " + ex.Message);
        }
    }
}
