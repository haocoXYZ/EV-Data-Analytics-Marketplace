using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Services;

namespace EVDataMarketplace.API.Controllers;

// B6: Data Consumer thanh toan va su dung
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "DataConsumer")]
public class PaymentsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IPayOSService _payOSService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(EVDataMarketplaceDbContext context, IPayOSService payOSService, ILogger<PaymentsController> logger)
    {
        _context = context;
        _payOSService = payOSService;
        _logger = logger;
    }

    // POST: api/payments/create - Tao payment va checkout URL
    [HttpPost("create")]
    public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentCreateDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        decimal amount = 0;
        string description = "";

        // Lay thong tin goi da mua
        if (request.PaymentType == "OneTimePurchase")
        {
            var purchase = await _context.OneTimePurchases
                .Include(p => p.Dataset)
                .FirstOrDefaultAsync(p => p.OtpId == request.ReferenceId && p.ConsumerId == consumer.ConsumerId);

            if (purchase == null)
            {
                return NotFound(new { message = "Purchase not found" });
            }

            amount = purchase.TotalPrice ?? 0;
            description = "Mua du lieu 1 lan"; // Max 25 chars for PayOS
        }
        else if (request.PaymentType == "Subscription")
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Dataset)
                .FirstOrDefaultAsync(s => s.SubId == request.ReferenceId && s.ConsumerId == consumer.ConsumerId);

            if (subscription == null)
            {
                return NotFound(new { message = "Subscription not found" });
            }

            amount = subscription.TotalPrice ?? 0;
            description = "Dang ky thue bao"; // Max 25 chars for PayOS
        }
        else if (request.PaymentType == "APIPackage")
        {
            var apiPackage = await _context.APIPackages
                .Include(a => a.Dataset)
                .FirstOrDefaultAsync(a => a.ApiId == request.ReferenceId && a.ConsumerId == consumer.ConsumerId);

            if (apiPackage == null)
            {
                return NotFound(new { message = "API Package not found" });
            }

            amount = apiPackage.TotalPaid ?? 0;
            description = "Mua goi API"; // Max 25 chars for PayOS
        }
        else
        {
            return BadRequest(new { message = "Invalid payment type" });
        }

        // Tao payment record
        var payment = new Payment
        {
            ConsumerId = consumer.ConsumerId,
            Amount = amount,
            PaymentDate = DateTime.Now,
            PaymentMethod = "PayOS",
            PaymentType = request.PaymentType,
            ReferenceId = request.ReferenceId,
            Status = "Pending",
            PayosOrderId = Guid.NewGuid().ToString("N")
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // Tao payment link voi PayOS
        var paymentResult = await _payOSService.CreatePaymentLinkAsync(payment.PaymentId, amount, description);

        return Ok(new PaymentResponseDto
        {
            PaymentId = payment.PaymentId,
            PayosOrderId = payment.PayosOrderId,
            CheckoutUrl = paymentResult.CheckoutUrl,
            QrCode = paymentResult.QrCode,
            Amount = amount,
            Status = payment.Status
        });
    }

    // POST: api/payments/webhook - PayOS callback
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> PaymentWebhook([FromBody] JsonElement webhookData, [FromHeader(Name = "x-signature")] string? signature)
    {
        try
        {
            _logger.LogInformation("Received PayOS webhook");

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Webhook signature missing");
                return BadRequest(new { message = "Signature required" });
            }

            var webhookJson = webhookData.GetRawText();
            var isValid = await _payOSService.VerifyPaymentWebhookAsync(webhookJson, signature);

            if (!isValid)
            {
                _logger.LogWarning("Invalid webhook signature");
                return BadRequest(new { message = "Invalid webhook signature" });
            }

            // Parse webhook data
            if (!webhookData.TryGetProperty("data", out var data))
            {
                return BadRequest(new { message = "Invalid webhook data format" });
            }

            var orderCode = data.TryGetProperty("orderCode", out var orderCodeProp)
                ? orderCodeProp.GetString() : null;
            var status = data.TryGetProperty("status", out var statusProp)
                ? statusProp.GetString() : null;
            var amount = data.TryGetProperty("amount", out var amountProp)
                ? amountProp.GetDecimal() : 0;

            if (string.IsNullOrEmpty(orderCode) || string.IsNullOrEmpty(status))
            {
                return BadRequest(new { message = "Missing required webhook fields" });
            }

            _logger.LogInformation("Webhook - OrderCode: {OrderCode}, Status: {Status}", orderCode, status);

            // Find payment by order code (stored in TransactionRef)
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for OrderCode: {OrderCode}", orderCode);
                return NotFound(new { message = "Payment not found" });
            }

            // Update payment status
            if (status.ToUpper() == "PAID")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;

                // Auto-create revenue share
                var dataset = await _context.Datasets
                    .Include(d => d.PricingTier)
                    .FirstOrDefaultAsync(d => d.DatasetId ==
                        (payment.PaymentType == "OneTimePurchase"
                            ? _context.OneTimePurchases.FirstOrDefault(o => o.OtpId == payment.ReferenceId)!.DatasetId
                            : payment.PaymentType == "Subscription"
                            ? _context.Subscriptions.FirstOrDefault(s => s.SubId == payment.ReferenceId)!.DatasetId
                            : _context.APIPackages.FirstOrDefault(a => a.ApiId == payment.ReferenceId)!.DatasetId));

                if (dataset?.PricingTier != null && dataset.ProviderId.HasValue)
                {
                    var providerShare = payment.Amount * (dataset.PricingTier.ProviderCommissionPercent / 100m);
                    var adminShare = payment.Amount * (dataset.PricingTier.AdminCommissionPercent / 100m);

                    var revenueShare = new RevenueShare
                    {
                        PaymentId = payment.PaymentId,
                        ProviderId = dataset.ProviderId.Value,
                        TotalAmount = payment.Amount,
                        ProviderShare = providerShare,
                        AdminShare = adminShare,
                        CalculatedDate = DateTime.Now,
                        PayoutStatus = "Pending"
                    };

                    _context.RevenueShares.Add(revenueShare);
                    _logger.LogInformation("Created revenue share for Payment {PaymentId}", payment.PaymentId);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} marked as Completed", payment.PaymentId);
            }
            else if (status.ToUpper() == "CANCELLED")
            {
                payment.Status = "Failed";
                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} marked as Failed", payment.PaymentId);
            }

            return Ok(new { message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayOS webhook");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    // POST: api/payments/{id}/complete - Manual complete payment (for testing)
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompletePayment(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id && p.ConsumerId == consumer.ConsumerId);

        if (payment == null)
        {
            return NotFound(new { message = "Payment not found" });
        }

        if (payment.Status == "Completed")
        {
            return BadRequest(new { message = "Payment already completed" });
        }

        // Update payment status
        payment.Status = "Completed";
        payment.TransactionRef = Guid.NewGuid().ToString("N");

        // Update purchase status
        if (payment.PaymentType == "OneTimePurchase")
        {
            var purchase = await _context.OneTimePurchases.FindAsync(payment.ReferenceId);
            if (purchase != null)
            {
                purchase.Status = "Completed";
            }
        }
        else if (payment.PaymentType == "Subscription")
        {
            var subscription = await _context.Subscriptions.FindAsync(payment.ReferenceId);
            if (subscription != null)
            {
                subscription.RenewalStatus = "Active";
            }
        }
        else if (payment.PaymentType == "APIPackage")
        {
            var apiPackage = await _context.APIPackages.FindAsync(payment.ReferenceId);
            if (apiPackage != null)
            {
                apiPackage.Status = "Active";
            }
        }

        // Tao revenue share record
        await CreateRevenueShare(payment);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Payment completed successfully" });
    }

    // GET: api/payments/my
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyPayments()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var payments = await _context.Payments
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                p.PaymentId,
                p.Amount,
                p.PaymentDate,
                p.PaymentMethod,
                p.PaymentType,
                p.ReferenceId,
                p.Status,
                p.TransactionRef
            })
            .ToListAsync();

        return Ok(payments);
    }

    // Helper method: Tao revenue share khi payment thanh cong
    private async Task CreateRevenueShare(Payment payment)
    {
        int? datasetId = null;
        int? providerId = null;

        // Lay dataset va provider info
        if (payment.PaymentType == "OneTimePurchase")
        {
            var purchase = await _context.OneTimePurchases
                .Include(p => p.Dataset)
                    .ThenInclude(d => d!.DataProvider)
                .FirstOrDefaultAsync(p => p.OtpId == payment.ReferenceId);

            datasetId = purchase?.DatasetId;
            providerId = purchase?.Dataset?.ProviderId;
        }
        else if (payment.PaymentType == "Subscription")
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Dataset)
                    .ThenInclude(d => d!.DataProvider)
                .FirstOrDefaultAsync(s => s.SubId == payment.ReferenceId);

            datasetId = subscription?.DatasetId;
            providerId = subscription?.Dataset?.ProviderId;
        }
        else if (payment.PaymentType == "APIPackage")
        {
            var apiPackage = await _context.APIPackages
                .Include(a => a.Dataset)
                    .ThenInclude(d => d!.DataProvider)
                .FirstOrDefaultAsync(a => a.ApiId == payment.ReferenceId);

            datasetId = apiPackage?.DatasetId;
            providerId = apiPackage?.Dataset?.ProviderId;
        }

        if (!datasetId.HasValue || !providerId.HasValue)
        {
            return;
        }

        // Lay tier info de tinh commission
        var dataset = await _context.Datasets
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == datasetId);

        if (dataset?.PricingTier == null)
        {
            return;
        }

        var totalAmount = payment.Amount ?? 0;
        var providerPercent = dataset.PricingTier.ProviderCommissionPercent ?? 70m;
        var adminPercent = dataset.PricingTier.AdminCommissionPercent ?? 30m;

        var providerShare = totalAmount * (providerPercent / 100m);
        var adminShare = totalAmount * (adminPercent / 100m);

        var revenueShare = new RevenueShare
        {
            PaymentId = payment.PaymentId,
            ProviderId = providerId,
            DatasetId = datasetId,
            TotalAmount = totalAmount,
            ProviderShare = providerShare,
            AdminShare = adminShare,
            CalculatedDate = DateTime.Now,
            PayoutStatus = "Pending"
        };

        _context.RevenueShares.Add(revenueShare);
    }
}
