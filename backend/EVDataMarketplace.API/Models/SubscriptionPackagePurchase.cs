using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Gói Subscription: Consumer subscribe khu vực để xem dashboard phân tích
/// Hiển thị biểu đồ: tiêu thụ điện theo thời gian, phân bố theo trạm,
/// giờ cao điểm, so sánh giữa các khu vực
/// </summary>
[Table("SubscriptionPackagePurchase")]
public class SubscriptionPackagePurchase
{
    [Key]
    [Column("subscription_id")]
    public int SubscriptionId { get; set; }

    [Required]
    [Column("consumer_id")]
    public int ConsumerId { get; set; }

    // Location scope
    [Required]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [Column("district_id")]
    public int? DistrictId { get; set; } // Null = toàn tỉnh

    // Subscription period
    [Required]
    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Required]
    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("billing_cycle")]
    public string BillingCycle { get; set; } = "Monthly"; // Monthly, Quarterly, Yearly

    // Pricing
    [Required]
    [Column("monthly_price", TypeName = "decimal(18, 2)")]
    public decimal MonthlyPrice { get; set; }

    [Required]
    [Column("total_paid", TypeName = "decimal(18, 2)")]
    public decimal TotalPaid { get; set; }

    [Column("purchase_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    // Status
    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending"; // Pending, Active, Cancelled, Expired

    [Column("auto_renew")]
    public bool AutoRenew { get; set; } = false;

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    // Usage tracking
    [Column("dashboard_access_count")]
    public int DashboardAccessCount { get; set; } = 0;

    [Column("last_access_date")]
    public DateTime? LastAccessDate { get; set; }

    // Navigation properties
    [ForeignKey("ConsumerId")]
    public virtual DataConsumer? DataConsumer { get; set; }

    [ForeignKey("ProvinceId")]
    public virtual Province? Province { get; set; }

    [ForeignKey("DistrictId")]
    public virtual District? District { get; set; }
}
