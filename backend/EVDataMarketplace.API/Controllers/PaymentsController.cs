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

        // Luu OrderCode vao TransactionRef de tim payment trong webhook
        payment.TransactionRef = paymentResult.OrderCode.ToString();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created payment {PaymentId} with OrderCode {OrderCode}", payment.PaymentId, paymentResult.OrderCode);

        return Ok(new PaymentResponseDto
        {
            PaymentId = payment.PaymentId,
            PayosOrderId = paymentResult.OrderCode.ToString(),
            CheckoutUrl = paymentResult.CheckoutUrl,
            QrCode = paymentResult.QrCode,
            Amount = amount,
            Status = payment.Status
        });
    }

    // GET: api/payments/callback - PayOS return URL callback
    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> PaymentCallback([FromQuery] string? orderCode, [FromQuery] string? status)
    {
        try
        {
            _logger.LogInformation("Payment callback received - OrderCode: {OrderCode}, Status: {Status}", orderCode, status);

            if (string.IsNullOrEmpty(orderCode))
            {
                return BadRequest(new { message = "OrderCode is required" });
            }

            // Find payment by order code
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for OrderCode: {OrderCode}", orderCode);
                return Redirect($"http://localhost:5173/payment/failed?message=Payment not found");
            }

            // Get payment status from PayOS và update database
            var paymentStatus = await _payOSService.GetPaymentStatusAsync(orderCode);

            // Update payment status in database if completed
            if (paymentStatus.Status == "Completed" && payment.Status != "Completed")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;
                
                await UpdatePurchaseStatus(payment);
                await CreateRevenueShare(payment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Payment {PaymentId} updated to Completed via callback", payment.PaymentId);
            }

            if (paymentStatus.Status == "Completed")
            {
                return Redirect($"http://localhost:5173/payment/success?orderId={orderCode}&paymentId={payment.PaymentId}");
            }
            else if (paymentStatus.Status == "Failed")
            {
                return Redirect($"http://localhost:5173/payment/failed?orderId={orderCode}");
            }
            else
            {
                return Redirect($"http://localhost:5173/payment/pending?orderId={orderCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment callback");
            return Redirect($"http://localhost:5173/payment/failed?message=Error processing callback");
        }
    }

    // GET: api/payments/{id}/check-status - Manual check and update payment status
    [HttpGet("{id}/check-status")]
    public async Task<ActionResult<object>> CheckPaymentStatus(int id)
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

        if (string.IsNullOrEmpty(payment.TransactionRef))
        {
            return BadRequest(new { message = "Payment has no transaction reference" });
        }

        try
        {
            // Get status from PayOS
            var paymentStatus = await _payOSService.GetPaymentStatusAsync(payment.TransactionRef);
            
            _logger.LogInformation("Checked PayOS status for Payment {PaymentId}: {Status}", payment.PaymentId, paymentStatus.Status);

            // Update if status changed to Completed
            if (paymentStatus.Status == "Completed" && payment.Status != "Completed")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;
                
                await UpdatePurchaseStatus(payment);
                await CreateRevenueShare(payment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Payment {PaymentId} updated to Completed via manual check", payment.PaymentId);
                
                return Ok(new { 
                    message = "Payment status updated successfully",
                    paymentId = payment.PaymentId,
                    oldStatus = "Pending",
                    newStatus = "Completed",
                    paymentDate = payment.PaymentDate
                });
            }
            else if (paymentStatus.Status == "Failed" && payment.Status != "Failed")
            {
                payment.Status = "Failed";
                await _context.SaveChangesAsync();
                
                return Ok(new { 
                    message = "Payment marked as failed",
                    paymentId = payment.PaymentId,
                    status = "Failed"
                });
            }
            
            return Ok(new { 
                message = "Payment status checked",
                paymentId = payment.PaymentId,
                currentStatus = payment.Status,
                payOSStatus = paymentStatus.Status,
                noUpdateNeeded = payment.Status == paymentStatus.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking payment status from PayOS");
            return StatusCode(500, new { message = "Error checking payment status", error = ex.Message });
        }
    }

    // POST: api/payments/webhook - PayOS webhook callback
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> PaymentWebhook([FromBody] JsonElement webhookData)
    {
        try
        {
            _logger.LogInformation("Received PayOS webhook: {Data}", webhookData.GetRawText());

            // Parse webhook data theo format PayOS
            // Format: { "data": { "orderCode": long, "amount": int, "description": string, "status": string, ... } }
            if (!webhookData.TryGetProperty("data", out var data))
            {
                _logger.LogWarning("Webhook missing 'data' property");
                return BadRequest(new { message = "Invalid webhook data format" });
            }

            var orderCode = data.TryGetProperty("orderCode", out var orderCodeProp)
                ? orderCodeProp.GetInt64().ToString() : null;
            var status = data.TryGetProperty("status", out var statusProp)
                ? statusProp.GetString() : null;
            var amount = data.TryGetProperty("amount", out var amountProp)
                ? amountProp.GetDecimal() : 0;

            if (string.IsNullOrEmpty(orderCode) || string.IsNullOrEmpty(status))
            {
                _logger.LogWarning("Webhook missing required fields");
                return BadRequest(new { message = "Missing required webhook fields" });
            }

            _logger.LogInformation("Processing webhook - OrderCode: {OrderCode}, Status: {Status}, Amount: {Amount}", 
                orderCode, status, amount);

            // Find payment by order code (stored in TransactionRef)
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for OrderCode: {OrderCode}", orderCode);
                // Return 200 OK to prevent PayOS retrying
                return Ok(new { message = "Payment not found but acknowledged" });
            }

            // Update payment status based on PayOS status
            if (status.ToUpper() == "PAID" && payment.Status != "Completed")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;

                // Update purchase/subscription status
                await UpdatePurchaseStatus(payment);

                // Auto-create revenue share
                await CreateRevenueShare(payment);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} marked as Completed via webhook", payment.PaymentId);
            }
            else if (status.ToUpper() == "CANCELLED" && payment.Status != "Failed")
            {
                payment.Status = "Failed";
                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} marked as Failed via webhook", payment.PaymentId);
            }

            return Ok(new { 
                message = "Webhook processed successfully", 
                paymentId = payment.PaymentId,
                status = payment.Status 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayOS webhook");
            // Return 200 OK to prevent PayOS retrying
            return Ok(new { message = "Webhook received but error occurred", error = ex.Message });
        }
    }

    // Helper method: Update purchase/subscription status
    private async Task UpdatePurchaseStatus(Payment payment)
    {
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
