using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Dataset")]
public class Dataset
{
    [Key]
    [Column("dataset_id")]
    public int DatasetId { get; set; }

    [Column("provider_id")]
    public int? ProviderId { get; set; }

    [Column("port_id")]
    public int? PortId { get; set; }

    [Column("tier_id")]
    public int? TierId { get; set; }

    [MaxLength(255)]
    [Column("name")]
    public string? Name { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(150)]
    [Column("category")]
    public string? Category { get; set; }

    [MaxLength(50)]
    [Column("data_format")]
    public string? DataFormat { get; set; }

    [Column("data_size_mb")]
    public decimal? DataSizeMb { get; set; }

    [Column("upload_date")]
    public DateTime? UploadDate { get; set; }

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

    [MaxLength(500)]
    [Column("file_path")]
    public string? FilePath { get; set; }

    // Navigation properties
    [ForeignKey("ProviderId")]
    public DataProvider? DataProvider { get; set; }

    [ForeignKey("TierId")]
    public PricingTier? PricingTier { get; set; }

    public ICollection<DatasetModeration> DatasetModerations { get; set; } = new List<DatasetModeration>();
    public ICollection<DatasetRecord> DatasetRecords { get; set; } = new List<DatasetRecord>();
    public ICollection<OneTimePurchase> OneTimePurchases { get; set; } = new List<OneTimePurchase>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<APIPackage> APIPackages { get; set; } = new List<APIPackage>();
}
