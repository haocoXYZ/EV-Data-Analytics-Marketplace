using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Dataset")]
public class Dataset
{
    [Key]
    [Column("dataset_id")]
    public int DatasetId { get; set; }

    [Required]
    [Column("provider_id")]
    public int ProviderId { get; set; }

    [Column("port_id")]
    public int? PortId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(150)]
    [Column("category")]
    public string? Category { get; set; }

    [MaxLength(50)]
    [Column("data_format")]
    public string? DataFormat { get; set; } = "CSV";

    [Column("row_count")]
    public int RowCount { get; set; } = 0; // Số dòng dữ liệu trong dataset

    [Column("upload_date")]
    public DateTime UploadDate { get; set; } = DateTime.Now;

    [Column("last_updated")]
    public DateTime? LastUpdated { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; } // Pending, Approved, Rejected, Active, Inactive

    [MaxLength(50)]
    [Column("visibility")]
    public string? Visibility { get; set; } // Public, Private

    [MaxLength(50)]
    [Column("moderation_status")]
    public string ModerationStatus { get; set; } = "Pending"; // Pending, UnderReview, Approved, Rejected

    // Navigation properties
    [ForeignKey("ProviderId")]
    public DataProvider? DataProvider { get; set; }

    public ICollection<DatasetModeration> DatasetModerations { get; set; } = new List<DatasetModeration>();
    public ICollection<DatasetRecord> DatasetRecords { get; set; } = new List<DatasetRecord>();
}
