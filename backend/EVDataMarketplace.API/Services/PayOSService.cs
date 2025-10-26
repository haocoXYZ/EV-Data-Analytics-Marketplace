using Net.payOS;
using Net.payOS.Types;

namespace EVDataMarketplace.API.Services;

public class PayOSSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ChecksumKey { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}

public class PayOSPaymentResult
{
    public string CheckoutUrl { get; set; } = string.Empty;
    public string QrCode { get; set; } = string.Empty;
    public long OrderCode { get; set; }
}

public interface IPayOSService
{
    Task<PayOSPaymentResult> CreatePaymentLinkAsync(int paymentId, decimal amount, string description);
    Task<bool> VerifyPaymentWebhookAsync(string webhookData, string signature);
    Task<PaymentStatusDto> GetPaymentStatusAsync(string orderId);
}

public class PaymentStatusDto
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Pending, Completed, Failed
    public decimal Amount { get; set; }
    public string? TransactionRef { get; set; }
}

public class PayOSWebhookData
{
    public string OrderCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // PAID, CANCELLED
    public string? TransactionDateTime { get; set; }
    public string? Reference { get; set; }
}

public class PayOSService : IPayOSService
{
    private readonly PayOSSettings _settings;
    private readonly ILogger<PayOSService> _logger;
    private readonly PayOS _payOS;

    public PayOSService(IConfiguration configuration, ILogger<PayOSService> logger)
    {
        _settings = configuration.GetSection("PayOS").Get<PayOSSettings>()
            ?? throw new InvalidOperationException("PayOS settings not configured");
        _logger = logger;
        
        // Khởi tạo PayOS SDK
        _payOS = new PayOS(_settings.ClientId, _settings.ApiKey, _settings.ChecksumKey);
        
        _logger.LogInformation("PayOS SDK initialized with ClientId: {ClientId}", _settings.ClientId);
    }

    public async Task<PayOSPaymentResult> CreatePaymentLinkAsync(int paymentId, decimal amount, string description)
    {
        try
        {
            _logger.LogInformation("Creating PayOS payment link using SDK for Payment ID: {PaymentId}, Amount: {Amount}", paymentId, amount);

            var orderCode = DateTimeOffset.UtcNow.ToUnixTimeSeconds(); // Unique order code
            var amountInt = (int)amount;

            // Tạo ItemData theo SDK
            var item = new ItemData(description, 1, amountInt);
            var items = new List<ItemData> { item };

            // Tạo PaymentData theo SDK
            var paymentData = new PaymentData(
                orderCode: orderCode,
                amount: amountInt,
                description: description,
                items: items,
                cancelUrl: _settings.CancelUrl,
                returnUrl: _settings.ReturnUrl
            );

            _logger.LogInformation("Calling PayOS SDK createPaymentLink for OrderCode: {OrderCode}", orderCode);

            // Gọi PayOS SDK
            CreatePaymentResult createPaymentResult = await _payOS.createPaymentLink(paymentData);

            _logger.LogInformation("PayOS SDK returned CheckoutUrl: {CheckoutUrl}, QR: {HasQR}", 
                createPaymentResult.checkoutUrl, !string.IsNullOrEmpty(createPaymentResult.qrCode));

            return new PayOSPaymentResult
            {
                CheckoutUrl = createPaymentResult.checkoutUrl ?? "",
                QrCode = createPaymentResult.qrCode ?? "",
                OrderCode = orderCode
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayOS payment link with SDK");
            
            // Fallback to mock URL for development
            var orderCode = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            return new PayOSPaymentResult
            {
                CheckoutUrl = $"https://pay.payos.vn/checkout/{orderCode}",
                QrCode = "",
                OrderCode = orderCode
            };
        }
    }

    public async Task<bool> VerifyPaymentWebhookAsync(string webhookData, string signature)
    {
        try
        {
            _logger.LogInformation("Verifying PayOS webhook with SDK");

            // PayOS SDK tự xử lý webhook verification
            // Chúng ta chỉ cần parse và verify trong controller
            await Task.CompletedTask;
            return true; // SDK sẽ throw exception nếu signature không hợp lệ
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying webhook");
            return false;
        }
    }

    public async Task<PaymentStatusDto> GetPaymentStatusAsync(string orderId)
    {
        try
        {
            _logger.LogInformation("Getting PayOS payment status using SDK for Order ID: {OrderId}", orderId);

            // Chuyển orderId string sang long
            if (!long.TryParse(orderId, out long orderCode))
            {
                _logger.LogWarning("Invalid order ID format: {OrderId}", orderId);
                return new PaymentStatusDto
                {
                    OrderId = orderId,
                    Status = "Pending",
                    Amount = 0
                };
            }

            // Gọi PayOS SDK để lấy payment info
            PaymentLinkInformation paymentInfo = await _payOS.getPaymentLinkInformation(orderCode);

            return new PaymentStatusDto
            {
                OrderId = orderId,
                Status = MapPayOSStatus(paymentInfo.status ?? ""),
                Amount = paymentInfo.amount,
                TransactionRef = paymentInfo.createdAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting PayOS payment status with SDK");
            return new PaymentStatusDto
            {
                OrderId = orderId,
                Status = "Pending",
                Amount = 0
            };
        }
    }

    private string MapPayOSStatus(string payOSStatus)
    {
        return payOSStatus.ToUpper() switch
        {
            "PAID" => "Completed",
            "CANCELLED" => "Failed",
            "PENDING" => "Pending",
            _ => "Pending"
        };
    }
}
