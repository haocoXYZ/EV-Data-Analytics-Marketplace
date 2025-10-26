using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("OneTimePurchase")]
public class OneTimePurchase
{
    [Key]
    [Column("otp_id")]
    public int OtpId { get; set; }

    [Column("dataset_id")]
    public int? DatasetId { get; set; }

    [Column("consumer_id")]
    public int? ConsumerId { get; set; }

    [Column("purchase_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("total_price")]
    public decimal? TotalPrice { get; set; }

    [MaxLength(50)]
    [Column("license_type")]
    public string? LicenseType { get; set; } // Research, Commercial

    [Column("download_count")]
    public int DownloadCount { get; set; } = 0;

    [Column("max_download")]
    public int MaxDownload { get; set; } = 3;

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; } // Pending, Completed, Expired

    // Navigation properties
    [ForeignKey("DatasetId")]
    public Dataset? Dataset { get; set; }

    [ForeignKey("ConsumerId")]
    public DataConsumer? DataConsumer { get; set; }
}
