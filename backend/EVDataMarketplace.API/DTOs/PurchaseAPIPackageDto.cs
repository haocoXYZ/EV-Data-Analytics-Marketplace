using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class PurchaseAPIPackageDto
{
    public int? ProvinceId { get; set; }

    public int? DistrictId { get; set; }

    [Required]
    [Range(100, 1000000)]
    public int ApiCallsPurchased { get; set; }
}
