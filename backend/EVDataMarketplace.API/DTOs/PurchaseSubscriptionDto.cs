using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class PurchaseSubscriptionDto
{
    [Required]
    public int ProvinceId { get; set; }

    public int? DistrictId { get; set; }

    [Required]
    [RegularExpression("^(Monthly|Quarterly|Yearly)$")]
    public string BillingCycle { get; set; } = "Monthly";
}
