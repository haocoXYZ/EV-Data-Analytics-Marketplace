using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Quận/Huyện/Phường thuộc tỉnh thành
/// </summary>
[Table("District")]
public class District
{
    [Key]
    [Column("district_id")]
    public int DistrictId { get; set; }

    [Required]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("type")]
    public string? Type { get; set; } // Quận, Huyện, Thị xã, Thành phố

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    [ForeignKey("ProvinceId")]
    public virtual Province? Province { get; set; }

    public ICollection<DatasetRecord> DatasetRecords { get; set; } = new List<DatasetRecord>();
}
