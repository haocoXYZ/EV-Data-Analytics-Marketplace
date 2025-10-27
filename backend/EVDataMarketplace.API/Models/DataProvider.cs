using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("DataProvider")]
public class DataProvider
{
    [Key]
    [Column("provider_id")]
    public int ProviderId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("company_name")]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("company_website")]
    public string? CompanyWebsite { get; set; }

    [MaxLength(150)]
    [Column("contact_email")]
    public string? ContactEmail { get; set; }

    [MaxLength(20)]
    [Column("contact_phone")]
    public string? ContactPhone { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("province_id")]
    public int? ProvinceId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("ProvinceId")]
    public Province? Province { get; set; }

    public ICollection<Dataset> Datasets { get; set; } = new List<Dataset>();
    public ICollection<RevenueShare> RevenueShares { get; set; } = new List<RevenueShare>();
    public ICollection<Payout> Payouts { get; set; } = new List<Payout>();
}
