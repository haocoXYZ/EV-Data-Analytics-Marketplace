using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Services;

public interface ICsvParserService
{
    Task<(bool success, string message, List<DatasetRecord> records)> ParseAndValidateCsvAsync(
        Stream fileStream,
        int datasetId,
        string providerName);

    byte[] GenerateCsvTemplate();
}
