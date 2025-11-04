using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EVDataMarketplace.API.Models;

[Table("User")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("role")]
    public string Role { get; set; } = string.Empty; // Admin, Moderator, DataProvider, DataConsumer

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Active"; // Active, Inactive, Suspended

    // Navigation properties
    public DataProvider? DataProvider { get; set; }
    public DataConsumer? DataConsumer { get; set; }
    public ICollection<DatasetModeration> DatasetModerations { get; set; } = new List<DatasetModeration>();
}
