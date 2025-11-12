using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class UpgradeSubscriptionDto
{
    [Required]
    public int CurrentSubscriptionId { get; set; }

    [Required]
    [RegularExpression("^(Monthly|Quarterly|Yearly)$")]
    public string NewBillingCycle { get; set; } = null!;
}
