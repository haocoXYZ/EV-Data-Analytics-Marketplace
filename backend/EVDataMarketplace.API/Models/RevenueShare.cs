using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("RevenueShare")]
public class RevenueShare
{
    [Key]
    [Column("share_id")]
    public int ShareId { get; set; }

    [Column("payment_id")]
    public int? PaymentId { get; set; }

    [Column("provider_id")]
    public int? ProviderId { get; set; }

    [Column("dataset_id")]
    public int? DatasetId { get; set; }

    [Column("total_amount")]
    public decimal? TotalAmount { get; set; }

    [Column("provider_share")]
    public decimal? ProviderShare { get; set; }

    [Column("admin_share")]
    public decimal? AdminShare { get; set; }

    [Column("calculated_date")]
    public DateTime CalculatedDate { get; set; } = DateTime.Now;

    [MaxLength(50)]
    [Column("payout_status")]
    public string PayoutStatus { get; set; } = "Pending"; // Pending, Paid

    // Navigation properties
    [ForeignKey("PaymentId")]
    public Payment? Payment { get; set; }

    [ForeignKey("ProviderId")]
    public DataProvider? DataProvider { get; set; }

    [ForeignKey("DatasetId")]
    public Dataset? Dataset { get; set; }
}
