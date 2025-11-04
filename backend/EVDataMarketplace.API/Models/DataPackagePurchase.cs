using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Gói Data: Consumer chọn tỉnh thành + quận/huyện,
/// xem số dòng dữ liệu sẽ nhận được, mua và download CSV
/// Dữ liệu được gom từ tất cả providers trong khu vực
/// </summary>
[Table("DataPackagePurchase")]
public class DataPackagePurchase
{
    [Key]
    [Column("purchase_id")]
    public int PurchaseId { get; set; }

    [Required]
    [Column("consumer_id")]
    public int ConsumerId { get; set; }

    // Location filter
    [Required]
    [Column("province_id")]
    public int ProvinceId { get; set; }

    [Column("district_id")]
    public int? DistrictId { get; set; } // Null = toàn tỉnh

    // Date range filter (optional)
    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    // Purchase details
    [Required]
    [Column("row_count")]
    public int RowCount { get; set; } // Số dòng dữ liệu được mua

    [Required]
    [Column("price_per_row", TypeName = "decimal(18, 4)")]
    public decimal PricePerRow { get; set; }

    [Required]
    [Column("total_price", TypeName = "decimal(18, 2)")]
    public decimal TotalPrice { get; set; }

    [Column("purchase_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    // Download tracking
    [Column("download_count")]
    public int DownloadCount { get; set; } = 0;

    [Column("max_download")]
    public int MaxDownload { get; set; } = 5;

    [Column("last_download_date")]
    public DateTime? LastDownloadDate { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending"; // Pending, Active, Expired

    // Navigation properties
    [ForeignKey("ConsumerId")]
    public virtual DataConsumer? DataConsumer { get; set; }

    [ForeignKey("ProvinceId")]
    public virtual Province? Province { get; set; }

    [ForeignKey("DistrictId")]
    public virtual District? District { get; set; }
}
