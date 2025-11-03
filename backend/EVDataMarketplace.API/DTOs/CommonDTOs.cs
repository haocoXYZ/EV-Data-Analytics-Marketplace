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
}

// Payment DTOs
public class PaymentCreateDto
{
    public string PaymentType { get; set; } = string.Empty; // DataPackage, SubscriptionPackage, APIPackage
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
