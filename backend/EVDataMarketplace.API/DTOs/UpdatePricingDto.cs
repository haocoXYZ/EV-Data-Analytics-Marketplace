using System.ComponentModel.DataAnnotations;

namespace EVDataMarketplace.API.DTOs;

public class UpdatePricingDto
{
    [Range(0.01, 10000)]
    public decimal? PricePerRow { get; set; }

    [Range(0, 100000000)]
    public decimal? SubscriptionMonthlyBase { get; set; }

    [Range(0.01, 10000)]
    public decimal? ApiPricePerCall { get; set; }

    [Range(0, 100)]
    public decimal? ProviderCommissionPercent { get; set; }

    [Range(0, 100)]
    public decimal? AdminCommissionPercent { get; set; }
}
