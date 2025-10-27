namespace EVDataMarketplace.API.DTOs;

// Auth DTOs
public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // DataProvider, DataConsumer

    // Optional fields for DataProvider
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }

    // Optional fields for DataConsumer
    public string? OrganizationName { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

// User DTOs
public class UserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// Dataset DTOs
public class DatasetCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public int? TierId { get; set; }
    public string? DataFormat { get; set; }
}

public class DatasetDto
{
    public int DatasetId { get; set; }
    public int? ProviderId { get; set; }
    public string? ProviderName { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? DataFormat { get; set; }
    public decimal? DataSizeMb { get; set; }
    public DateTime? UploadDate { get; set; }
    public string? Status { get; set; }
    public string? ModerationStatus { get; set; }
    public string? TierName { get; set; }
    public decimal? BasePricePerMb { get; set; }
    public decimal? ApiPricePerCall { get; set; }
    public decimal? SubscriptionPricePerRegion { get; set; }
}

// Purchase DTOs
public class OneTimePurchaseRequestDto
{
    public int DatasetId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string LicenseType { get; set; } = "Research"; // Research, Commercial
}

public class SubscriptionRequestDto
{
    public int DatasetId { get; set; }
    public int ProvinceId { get; set; }
    public string RenewalCycle { get; set; } = "Monthly"; // Monthly, Quarterly, Yearly
    public int DurationMonths { get; set; } = 1;
}

public class APIPackageRequestDto
{
    public int DatasetId { get; set; }
    public int ApiCallsCount { get; set; }
}

// Payment DTOs
public class PaymentCreateDto
{
    public string PaymentType { get; set; } = string.Empty; // OneTimePurchase, Subscription, APIPackage
    public int ReferenceId { get; set; }
}

public class PaymentResponseDto
{
    public int PaymentId { get; set; }
    public string? PayosOrderId { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? QrCode { get; set; } // Base64 QR code image
    public decimal? Amount { get; set; }
    public string? Status { get; set; }
}

// Moderation DTOs
public class DatasetModerationDto
{
    public int DatasetId { get; set; }
    public string ModerationStatus { get; set; } = string.Empty; // Approved, Rejected
    public string? Comments { get; set; }
}

// Pricing Tier DTOs
public class PricingTierDto
{
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? BasePricePerMb { get; set; }
    public decimal? ApiPricePerCall { get; set; }
    public decimal? SubscriptionPricePerRegion { get; set; }
    public decimal? ProviderCommissionPercent { get; set; }
    public decimal? AdminCommissionPercent { get; set; }
    public bool IsActive { get; set; }
}

public class PricingTierCreateDto
{
    public string TierName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? BasePricePerMb { get; set; }
    public decimal? ApiPricePerCall { get; set; }
    public decimal? SubscriptionPricePerRegion { get; set; }
    public decimal ProviderCommissionPercent { get; set; } = 70m;
    public decimal AdminCommissionPercent { get; set; } = 30m;
}
