using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Subscription")]
public class Subscription
{
    [Key]
    [Column("sub_id")]
    public int SubId { get; set; }

    [Column("dataset_id")]
    public int? DatasetId { get; set; }

    [Column("consumer_id")]
    public int? ConsumerId { get; set; }

    [Column("province_id")]
    public int? ProvinceId { get; set; }

    [Column("sub_start")]
    public DateTime? SubStart { get; set; }

    [Column("sub_end")]
    public DateTime? SubEnd { get; set; }

    [MaxLength(50)]
    [Column("renewal_status")]
    public string? RenewalStatus { get; set; } // Active, Cancelled, Expired

    [MaxLength(50)]
    [Column("renewal_cycle")]
    public string? RenewalCycle { get; set; } // Monthly, Quarterly, Yearly

    [Column("total_price")]
    public decimal? TotalPrice { get; set; }

    [Column("request_count")]
    public int RequestCount { get; set; } = 0;

    // Navigation properties
    [ForeignKey("DatasetId")]
    public Dataset? Dataset { get; set; }

    [ForeignKey("ConsumerId")]
    public DataConsumer? DataConsumer { get; set; }

    [ForeignKey("ProvinceId")]
    public Province? Province { get; set; }
}
