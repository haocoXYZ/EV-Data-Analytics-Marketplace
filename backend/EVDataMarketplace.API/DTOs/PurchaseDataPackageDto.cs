using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class PurchaseDataPackageDto
{
    [Required]
    public int ProvinceId { get; set; }

    public int? DistrictId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
