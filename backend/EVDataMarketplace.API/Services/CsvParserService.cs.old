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
    string ConvertRecordsToCsv(List<string> recordsJson);
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

    public string ConvertRecordsToCsv(List<string> recordsJson)
    {
        try
        {
            if (recordsJson.Count == 0)
            {
                return string.Empty;
            }

            // Deserialize first record to get headers
            var firstRecord = JsonSerializer.Deserialize<Dictionary<string, object>>(recordsJson[0]);
            if (firstRecord == null || firstRecord.Count == 0)
            {
                return string.Empty;
            }

            var headers = firstRecord.Keys.ToList();
            var csv = new StringBuilder();

            // Write header
            csv.AppendLine(string.Join(",", headers.Select(h => EscapeCsvValue(h))));

            // Write data rows
            foreach (var recordJson in recordsJson)
            {
                var record = JsonSerializer.Deserialize<Dictionary<string, object>>(recordJson);
                if (record != null)
                {
                    var values = headers.Select(h =>
                    {
                        if (record.TryGetValue(h, out var value))
                        {
                            return EscapeCsvValue(value?.ToString() ?? string.Empty);
                        }
                        return string.Empty;
                    });
                    csv.AppendLine(string.Join(",", values));
                }
            }

            _logger.LogInformation("Converted {Count} records to CSV", recordsJson.Count);
            return csv.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting records to CSV");
            throw new InvalidDataException("Failed to convert records to CSV: " + ex.Message);
        }
    }

    private string EscapeCsvValue(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        // Escape values containing comma, quote, or newline
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
