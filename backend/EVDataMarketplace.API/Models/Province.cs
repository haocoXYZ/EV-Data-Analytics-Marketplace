using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("Province")]
public class Province
{
    [Key]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("code")]
    public string? Code { get; set; } // Mã tỉnh (01, 02, ...)

    // Navigation properties
    public ICollection<District> Districts { get; set; } = new List<District>();
    public ICollection<DataProvider> DataProviders { get; set; } = new List<DataProvider>();
    public ICollection<DatasetRecord> DatasetRecords { get; set; } = new List<DatasetRecord>();
    public ICollection<DataPackagePurchase> DataPackagePurchases { get; set; } = new List<DataPackagePurchase>();
    public ICollection<SubscriptionPackagePurchase> SubscriptionPackagePurchases { get; set; } = new List<SubscriptionPackagePurchase>();
    public ICollection<APIPackagePurchase> APIPackagePurchases { get; set; } = new List<APIPackagePurchase>();
}
