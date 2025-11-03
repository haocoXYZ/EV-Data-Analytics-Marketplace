using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Cấu hình giá hệ thống cho các loại gói
/// Admin quản lý, tính theo số dòng dữ liệu
/// </summary>
[Table("SystemPricing")]
public class SystemPricing
{
    [Key]
    [Column("pricing_id")]
    public int PricingId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("package_type")]
    public string PackageType { get; set; } = string.Empty; // DataPackage, SubscriptionPackage, APIPackage

    [MaxLength(255)]
    [Column("description")]
    public string? Description { get; set; }

    // Giá theo dòng dữ liệu (VNĐ/dòng)
    [Column("price_per_row", TypeName = "decimal(18, 4)")]
    public decimal PricePerRow { get; set; }

    // Giá cho Subscription (VNĐ/tháng)
    [Column("subscription_monthly_base", TypeName = "decimal(18, 2)")]
    public decimal? SubscriptionMonthlyBase { get; set; }

    // Giá cho API Package (VNĐ/call)
    [Column("api_price_per_call", TypeName = "decimal(18, 4)")]
    public decimal? ApiPricePerCall { get; set; }

    // Commission split
    [Required]
    [Column("provider_commission_percent", TypeName = "decimal(5, 2)")]
    public decimal ProviderCommissionPercent { get; set; } = 70.0M; // Default 70%

    [Required]
    [Column("admin_commission_percent", TypeName = "decimal(5, 2)")]
    public decimal AdminCommissionPercent { get; set; } = 30.0M; // Default 30%

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
