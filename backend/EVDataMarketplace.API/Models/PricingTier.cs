using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("PricingTier")]
public class PricingTier
{
    [Key]
    [Column("tier_id")]
    public int TierId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("tier_name")]
    public string TierName { get; set; } = string.Empty; // Basic, Standard, Premium

    [Column("description")]
    public string? Description { get; set; }

    [Column("base_price_per_mb")]
    public decimal? BasePricePerMb { get; set; }

    [Column("api_price_per_call")]
    public decimal? ApiPricePerCall { get; set; }

    [Column("subscription_price_per_region")]
    public decimal? SubscriptionPricePerRegion { get; set; }

    [Column("provider_commission_percent")]
    public decimal? ProviderCommissionPercent { get; set; } // e.g., 70%

    [Column("admin_commission_percent")]
    public decimal? AdminCommissionPercent { get; set; } // e.g., 30%

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public ICollection<Dataset> Datasets { get; set; } = new List<Dataset>();
}
