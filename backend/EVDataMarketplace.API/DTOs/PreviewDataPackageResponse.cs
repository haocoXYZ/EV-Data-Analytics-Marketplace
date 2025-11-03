namespace EVDataMarketplace.API.DTOs;

public class PreviewDataPackageResponse
{
    public int RowCount { get; set; }
    public decimal PricePerRow { get; set; }
    public decimal TotalPrice { get; set; }
    public List<object> SampleData { get; set; } = new();
    public string ProvinceName { get; set; } = string.Empty;
    public string? DistrictName { get; set; }
}
