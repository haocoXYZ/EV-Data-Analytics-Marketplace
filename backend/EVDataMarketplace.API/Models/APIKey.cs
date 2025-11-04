using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// API Key được cấp cho consumer khi mua API Package
/// Dùng để authenticate và track API usage
/// </summary>
[Table("APIKey")]
public class APIKey
{
    [Key]
    [Column("key_id")]
    public int KeyId { get; set; }

    [Required]
    [Column("api_purchase_id")]
    public int ApiPurchaseId { get; set; }

    [Required]
    [Column("consumer_id")]
    public int ConsumerId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("key_value")]
    public string KeyValue { get; set; } = string.Empty; // The actual API key

    [MaxLength(255)]
    [Column("key_name")]
    public string? KeyName { get; set; } // Optional friendly name

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("last_used_at")]
    public DateTime? LastUsedAt { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("revoked_at")]
    public DateTime? RevokedAt { get; set; }

    [MaxLength(500)]
    [Column("revoked_reason")]
    public string? RevokedReason { get; set; }

    // Rate limiting tracking
    [Column("requests_today")]
    public int RequestsToday { get; set; } = 0;

    [Column("last_request_date")]
    public DateTime? LastRequestDate { get; set; }

    // Navigation properties
    [ForeignKey("ApiPurchaseId")]
    public virtual APIPackagePurchase? APIPackagePurchase { get; set; }

    [ForeignKey("ConsumerId")]
    public virtual DataConsumer? DataConsumer { get; set; }
}
