using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

/// <summary>
/// Lưu từng dòng dữ liệu của CSV file vào database
/// </summary>
[Table("DatasetRecords")]
public class DatasetRecord
{
    [Key]
    public long RecordId { get; set; }

    [Required]
    public int DatasetId { get; set; }

    /// <summary>
    /// Dữ liệu JSON của 1 dòng CSV (flexible schema)
    /// </summary>
    [Required]
    [Column(TypeName = "nvarchar(max)")]
    public string RecordData { get; set; } = string.Empty;

    /// <summary>
    /// Số thứ tự dòng trong file CSV gốc
    /// </summary>
    public int RowNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    [ForeignKey("DatasetId")]
    public virtual Dataset? Dataset { get; set; }
}
