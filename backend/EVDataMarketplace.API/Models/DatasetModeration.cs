using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("DatasetModeration")]
public class DatasetModeration
{
    [Key]
    [Column("moderation_id")]
    public int ModerationId { get; set; }

    [Column("dataset_id")]
    public int? DatasetId { get; set; }

    [Column("moderator_user_id")]
    public int? ModeratorUserId { get; set; }

    [Column("review_date")]
    public DateTime ReviewDate { get; set; } = DateTime.Now;

    [MaxLength(50)]
    [Column("moderation_status")]
    public string? ModerationStatus { get; set; } // Approved, Rejected, NeedRevision

    [Column("comments")]
    public string? Comments { get; set; }

    // Navigation properties
    [ForeignKey("DatasetId")]
    public Dataset? Dataset { get; set; }

    [ForeignKey("ModeratorUserId")]
    public User? Moderator { get; set; }
}
