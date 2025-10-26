using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("APIPackage")]
public class APIPackage
{
    [Key]
    [Column("api_id")]
    public int ApiId { get; set; }

    [Column("dataset_id")]
    public int? DatasetId { get; set; }

    [Column("consumer_id")]
    public int? ConsumerId { get; set; }

    [MaxLength(255)]
    [Column("api_key")]
    public string? ApiKey { get; set; }

    [Column("api_calls_purchased")]
    public int? ApiCallsPurchased { get; set; }

    [Column("api_calls_used")]
    public int ApiCallsUsed { get; set; } = 0;

    [Column("price_per_call")]
    public decimal? PricePerCall { get; set; }

    [Column("purchase_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    [Column("expiry_date")]
    public DateTime? ExpiryDate { get; set; }

    [Column("total_paid")]
    public decimal? TotalPaid { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; } // Active, Exhausted, Expired

    // Navigation properties
    [ForeignKey("DatasetId")]
    public Dataset? Dataset { get; set; }

    [ForeignKey("ConsumerId")]
    public DataConsumer? DataConsumer { get; set; }
}
