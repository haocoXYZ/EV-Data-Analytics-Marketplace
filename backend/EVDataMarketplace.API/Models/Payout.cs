using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Payout")]
public class Payout
{
    [Key]
    [Column("payout_id")]
    public int PayoutId { get; set; }

    [Column("provider_id")]
    public int? ProviderId { get; set; }

    [MaxLength(7)]
    [Column("month_year")]
    public string? MonthYear { get; set; } // Format: 2025-01

    [Column("total_due")]
    public decimal? TotalDue { get; set; }

    [Column("payout_date")]
    public DateTime? PayoutDate { get; set; }

    [MaxLength(50)]
    [Column("payout_status")]
    public string PayoutStatus { get; set; } = "Pending"; // Pending, Processing, Completed, Failed

    [MaxLength(100)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; } // BankTransfer, PayOS

    [MaxLength(100)]
    [Column("bank_account")]
    public string? BankAccount { get; set; }

    [MaxLength(100)]
    [Column("transaction_ref")]
    public string? TransactionRef { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    [ForeignKey("ProviderId")]
    public DataProvider? DataProvider { get; set; }
}
