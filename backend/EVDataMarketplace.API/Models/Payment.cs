using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Payment")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("consumer_id")]
    public int? ConsumerId { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("payment_date")]
    public DateTime PaymentDate { get; set; } = DateTime.Now;

    [MaxLength(100)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; } // PayOS, BankTransfer

    [MaxLength(100)]
    [Column("payment_type")]
    public string? PaymentType { get; set; } // OneTimePurchase, Subscription, APIPackage

    [Column("reference_id")]
    public int? ReferenceId { get; set; } // ID of otp_id, sub_id, or api_id

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; } // Pending, Completed, Failed, Refunded

    [MaxLength(100)]
    [Column("transaction_ref")]
    public string? TransactionRef { get; set; }

    [MaxLength(100)]
    [Column("payos_order_id")]
    public string? PayosOrderId { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    [ForeignKey("ConsumerId")]
    public DataConsumer? DataConsumer { get; set; }

    public ICollection<RevenueShare> RevenueShares { get; set; } = new List<RevenueShare>();
}
