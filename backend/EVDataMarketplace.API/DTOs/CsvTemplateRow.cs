namespace EVDataMarketplace.API.DTOs;

/// <summary>
/// Template structure for CSV upload
/// </summary>
public class CsvTemplateRow
{
    public string StationId { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public string StationAddress { get; set; } = string.Empty;
    public string StationOperator { get; set; } = string.Empty;
    public int ProvinceId { get; set; }
    public int DistrictId { get; set; }
    public DateTime ChargingTimestamp { get; set; }
    public decimal EnergyKwh { get; set; }
    public decimal? Voltage { get; set; }
    public decimal? Current { get; set; }
    public decimal? PowerKw { get; set; }
    public decimal? DurationMinutes { get; set; }
    public decimal? ChargingCost { get; set; }
    public string? VehicleType { get; set; }
    public decimal? BatteryCapacityKwh { get; set; }
    public decimal? SocStart { get; set; }
    public decimal? SocEnd { get; set; }
}
