using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Province")]
public class Province
{
    [Key]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [MaxLength(150)]
    [Column("name")]
    public string? Name { get; set; }

    // Navigation properties
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
