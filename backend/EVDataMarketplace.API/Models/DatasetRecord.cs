using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Lưu từng dòng dữ liệu thô của trạm sạc EV vào database
/// Dữ liệu được hợp nhất từ nhiều provider theo tỉnh thành và quận/huyện
/// </summary>
[Table("DatasetRecords")]
public class DatasetRecord
{
    [Key]
    public long RecordId { get; set; }

    [Required]
    public int DatasetId { get; set; }

    // Location Information
    [Required]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [Required]
    [Column("district_id")]
    public int DistrictId { get; set; }

    // Station Information
    [Required]
    [MaxLength(100)]
    [Column("station_id")]
    public string StationId { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("station_name")]
    public string StationName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("station_address")]
    public string? StationAddress { get; set; }

    [MaxLength(100)]
    [Column("station_operator")]
    public string? StationOperator { get; set; }

    // Charging Data
    [Required]
    [Column("charging_timestamp")]
    public DateTime ChargingTimestamp { get; set; }

    [Required]
    [Column("energy_kwh", TypeName = "decimal(18, 4)")]
    public decimal EnergyKwh { get; set; }

    [Column("voltage", TypeName = "decimal(10, 2)")]
    public decimal? Voltage { get; set; }

    [Column("current", TypeName = "decimal(10, 2)")]
    public decimal? Current { get; set; }

    [Column("power_kw", TypeName = "decimal(10, 2)")]
    public decimal? PowerKw { get; set; }

    [Column("duration_minutes", TypeName = "decimal(10, 2)")]
    public decimal? DurationMinutes { get; set; }

    [Column("charging_cost", TypeName = "decimal(18, 2)")]
    public decimal? ChargingCost { get; set; }

    // Vehicle Information (optional)
    [MaxLength(100)]
    [Column("vehicle_type")]
    public string? VehicleType { get; set; }

    [Column("battery_capacity_kwh", TypeName = "decimal(10, 2)")]
    public decimal? BatteryCapacityKwh { get; set; }

    [Column("soc_start", TypeName = "decimal(5, 2)")]
    public decimal? SocStart { get; set; } // State of Charge Start (%)

    [Column("soc_end", TypeName = "decimal(5, 2)")]
    public decimal? SocEnd { get; set; } // State of Charge End (%)

    // Metadata
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("data_source")]
    [MaxLength(100)]
    public string? DataSource { get; set; } // Tên provider upload

    // Navigation properties
    [ForeignKey("DatasetId")]
    public virtual Dataset? Dataset { get; set; }

    [ForeignKey("ProvinceId")]
    public virtual Province? Province { get; set; }

    [ForeignKey("DistrictId")]
    public virtual District? District { get; set; }
}
