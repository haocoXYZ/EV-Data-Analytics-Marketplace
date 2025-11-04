using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Gói API: Consumer mua số lượng API calls,
/// nhận API key để truy vấn dữ liệu theo nhu cầu
/// </summary>
[Table("APIPackagePurchase")]
public class APIPackagePurchase
{
    [Key]
    [Column("api_purchase_id")]
    public int ApiPurchaseId { get; set; }

    [Required]
    [Column("consumer_id")]
    public int ConsumerId { get; set; }

    // API access scope
    [Column("province_id")]
    public int? ProvinceId { get; set; } // Null = toàn quốc

    [Column("district_id")]
    public int? DistrictId { get; set; } // Null = toàn tỉnh

    // Package details
    [Required]
    [Column("api_calls_purchased")]
    public int ApiCallsPurchased { get; set; }

    [Column("api_calls_used")]
    public int ApiCallsUsed { get; set; } = 0;

    [Required]
    [Column("price_per_call", TypeName = "decimal(18, 4)")]
    public decimal PricePerCall { get; set; }

    [Required]
    [Column("total_paid", TypeName = "decimal(18, 2)")]
    public decimal TotalPaid { get; set; }

    [Column("purchase_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    // Expiry (optional, có thể không giới hạn thời gian)
    [Column("expiry_date")]
    public DateTime? ExpiryDate { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending"; // Pending, Active, Exhausted, Expired

    // Navigation properties
    [ForeignKey("ConsumerId")]
    public virtual DataConsumer? DataConsumer { get; set; }

    [ForeignKey("ProvinceId")]
    public virtual Province? Province { get; set; }

    [ForeignKey("DistrictId")]
    public virtual District? District { get; set; }

    // API Keys associated with this purchase
    public ICollection<APIKey> APIKeys { get; set; } = new List<APIKey>();
}
