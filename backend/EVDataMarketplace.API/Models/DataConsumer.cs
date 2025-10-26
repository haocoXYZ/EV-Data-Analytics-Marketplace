using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("DataConsumer")]
public class DataConsumer
{
    [Key]
    [Column("consumer_id")]
    public int ConsumerId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(150)]
    [Column("organization_name")]
    public string? OrganizationName { get; set; }

    [MaxLength(150)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [MaxLength(20)]
    [Column("contact_number")]
    public string? ContactNumber { get; set; }

    [MaxLength(150)]
    [Column("billing_email")]
    public string? BillingEmail { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public ICollection<OneTimePurchase> OneTimePurchases { get; set; } = new List<OneTimePurchase>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<APIPackage> APIPackages { get; set; } = new List<APIPackage>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
