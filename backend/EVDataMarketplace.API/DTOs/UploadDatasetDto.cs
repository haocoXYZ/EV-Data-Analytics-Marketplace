using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class UploadDatasetDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [Required]
    public IFormFile CsvFile { get; set; } = null!;
}
