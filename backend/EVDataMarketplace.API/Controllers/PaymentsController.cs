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

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IPayOSService _payOSService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        EVDataMarketplaceDbContext context,
        IPayOSService payOSService,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _payOSService = payOSService;
        _logger = logger;
    }

    /// <summary>
    /// Create payment for any package type
    /// </summary>
    [HttpPost("create")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentCreateDto request)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        decimal amount = 0;
        string description = "";

        // Get purchase details based on type
        switch (request.PaymentType)
        {
            case "DataPackage":
                var dataPackage = await _context.DataPackagePurchases
                    .FirstOrDefaultAsync(p => p.PurchaseId == request.ReferenceId && p.ConsumerId == consumer.ConsumerId);

                if (dataPackage == null)
                {
                    return NotFound(new { message = "Data package not found" });
                }

                if (dataPackage.Status == "Active")
                {
                    return BadRequest(new { message = "Data package already paid" });
                }

                amount = dataPackage.TotalPrice;
                description = "Data Package Purchase";
                break;

            case "SubscriptionPackage":
                var subscription = await _context.SubscriptionPackagePurchases
                    .FirstOrDefaultAsync(s => s.SubscriptionId == request.ReferenceId && s.ConsumerId == consumer.ConsumerId);

                if (subscription == null)
                {
                    return NotFound(new { message = "Subscription not found" });
                }

                if (subscription.Status == "Active")
                {
                    return BadRequest(new { message = "Subscription already paid" });
                }

                amount = subscription.TotalPaid;
                description = "Subscription Package";
                break;

            case "APIPackage":
                var apiPackage = await _context.APIPackagePurchases
                    .FirstOrDefaultAsync(a => a.ApiPurchaseId == request.ReferenceId && a.ConsumerId == consumer.ConsumerId);

                if (apiPackage == null)
                {
                    return NotFound(new { message = "API package not found" });
                }

                if (apiPackage.Status == "Active")
                {
                    return BadRequest(new { message = "API package already paid" });
                }

                amount = apiPackage.TotalPaid;
                description = "API Package Purchase";
                break;

            default:
                return BadRequest(new { message = "Invalid payment type. Must be DataPackage, SubscriptionPackage, or APIPackage" });
        }

        // Create payment record
        var payment = new Payment
        {
            ConsumerId = consumer.ConsumerId,
            Amount = amount,
            PaymentDate = DateTime.Now,
            PaymentMethod = "PayOS",
            PaymentType = request.PaymentType,
            ReferenceId = request.ReferenceId,
            Status = "Pending"
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        try
        {
            // Create PayOS checkout
            var paymentResult = await _payOSService.CreatePaymentLinkAsync(
                payment.PaymentId,
                amount,
                description
            );

            // Store transaction reference
            payment.TransactionRef = paymentResult.OrderCode.ToString();
            payment.PayosOrderId = paymentResult.OrderCode.ToString();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment {PaymentId} created for {Type} - Amount: {Amount}",
                payment.PaymentId, request.PaymentType, amount);

            return Ok(new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                CheckoutUrl = paymentResult.CheckoutUrl,
                Amount = amount,
                Status = payment.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayOS payment link");

            // Delete payment if PayOS fails
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return StatusCode(500, new { message = "Error creating payment link", error = ex.Message });
        }
    }

    /// <summary>
    /// PayOS webhook callback
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> PaymentWebhook([FromBody] JsonElement webhookData)
    {
        try
        {
            _logger.LogInformation("Received PayOS webhook: {Data}", webhookData.GetRawText());

            if (!webhookData.TryGetProperty("data", out var data))
            {
                _logger.LogWarning("Webhook missing 'data' property");
                return BadRequest(new { message = "Invalid webhook format" });
            }

            var orderCode = data.TryGetProperty("orderCode", out var orderCodeProp)
                ? orderCodeProp.GetInt64().ToString() : null;
            var status = data.TryGetProperty("status", out var statusProp)
                ? statusProp.GetString() : null;

            if (string.IsNullOrEmpty(orderCode) || string.IsNullOrEmpty(status))
            {
                _logger.LogWarning("Webhook missing required fields");
                return BadRequest(new { message = "Missing required fields" });
            }

            _logger.LogInformation("Processing webhook - OrderCode: {OrderCode}, Status: {Status}",
                orderCode, status);

            // Find payment
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for OrderCode: {OrderCode}", orderCode);
                return Ok(new { message = "Payment not found but acknowledged" });
            }

            // Process based on status
            if (status.ToUpper() == "PAID" && payment.Status != "Completed")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;

                await UpdatePurchaseStatus(payment);
                await CreateRevenueShare(payment);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} completed via webhook", payment.PaymentId);
            }
            else if (status.ToUpper() == "CANCELLED" && payment.Status != "Failed")
            {
                payment.Status = "Failed";
                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} failed via webhook", payment.PaymentId);
            }

            return Ok(new { message = "Webhook processed", paymentId = payment.PaymentId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return Ok(new { message = "Webhook received but error occurred" });
        }
    }

    /// <summary>
    /// PayOS callback after payment (browser redirect)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> PaymentCallback(
        [FromQuery] string code,
        [FromQuery] string id,
        [FromQuery] bool cancel,
        [FromQuery] string status,
        [FromQuery] long orderCode)
    {
        try
        {
            _logger.LogInformation("Received PayOS callback - Code: {Code}, Status: {Status}, OrderCode: {OrderCode}",
                code, status, orderCode);

            // Find payment by orderCode
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode.ToString());

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for OrderCode: {OrderCode}", orderCode);
                return Redirect($"http://localhost:5173/payment-failed?error=payment_not_found");
            }

            // Process based on code and status
            if (code == "00" && status.ToUpper() == "PAID" && payment.Status != "Completed")
            {
                payment.Status = "Completed";
                payment.PaymentDate = DateTime.Now;

                await UpdatePurchaseStatus(payment);
                await CreateRevenueShare(payment);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Payment {PaymentId} completed via callback", payment.PaymentId);

                // Redirect to frontend success page
                return Redirect($"http://localhost:5173/payment-success?paymentId={payment.PaymentId}&type={payment.PaymentType}&referenceId={payment.ReferenceId}");
            }
            else if (cancel || code != "00")
            {
                if (payment.Status != "Failed")
                {
                    payment.Status = "Failed";
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Payment {PaymentId} failed/cancelled via callback", payment.PaymentId);
                }

                // Redirect to frontend failure page
                return Redirect($"http://localhost:5173/payment-failed?paymentId={payment.PaymentId}&code={code}");
            }

            // Already processed
            _logger.LogInformation("Payment {PaymentId} already processed, status: {Status}", payment.PaymentId, payment.Status);
            return Redirect($"http://localhost:5173/payment-success?paymentId={payment.PaymentId}&type={payment.PaymentType}&referenceId={payment.ReferenceId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing callback");
            return Redirect($"http://localhost:5173/payment-failed?error=processing_error");
        }
    }

    /// <summary>
    /// Get payment status
    /// </summary>
    [HttpGet("{id}/status")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<IActionResult> GetPaymentStatus(int id)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null)
        {
            return NotFound(new { message = "Consumer not found" });
        }

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id && p.ConsumerId == consumer.ConsumerId);

        if (payment == null)
        {
            return NotFound(new { message = "Payment not found" });
        }

        return Ok(new
        {
            paymentId = payment.PaymentId,
            amount = payment.Amount,
            status = payment.Status,
            paymentType = payment.PaymentType,
            referenceId = payment.ReferenceId,
            paymentDate = payment.PaymentDate,
            transactionRef = payment.TransactionRef
        });
    }

    // Helper: Update purchase status after payment
    private async Task UpdatePurchaseStatus(Payment payment)
    {
        switch (payment.PaymentType)
        {
            case "DataPackage":
                var dataPackage = await _context.DataPackagePurchases
                    .FirstOrDefaultAsync(p => p.PurchaseId == payment.ReferenceId);
                if (dataPackage != null)
                {
                    dataPackage.Status = "Active";
                }
                break;

            case "SubscriptionPackage":
                var subscription = await _context.SubscriptionPackagePurchases
                    .FirstOrDefaultAsync(s => s.SubscriptionId == payment.ReferenceId);
                if (subscription != null)
                {
                    subscription.Status = "Active";
                }
                break;

            case "APIPackage":
                var apiPackage = await _context.APIPackagePurchases
                    .FirstOrDefaultAsync(a => a.ApiPurchaseId == payment.ReferenceId);
                if (apiPackage != null)
                {
                    apiPackage.Status = "Active";
                }
                break;
        }
    }

    // Helper: Create revenue share after payment
    private async Task CreateRevenueShare(Payment payment)
    {
        var pricing = await _context.SystemPricings
            .FirstOrDefaultAsync(p => p.PackageType == payment.PaymentType && p.IsActive);

        if (pricing == null)
        {
            _logger.LogWarning("No pricing found for {PaymentType}", payment.PaymentType);
            return;
        }

        if (payment.PaymentType == "DataPackage")
        {
            await CreateDataPackageRevenueShare(payment, pricing);
        }
        else if (payment.PaymentType == "SubscriptionPackage")
        {
            await CreateSubscriptionRevenueShare(payment, pricing);
        }
        else if (payment.PaymentType == "APIPackage")
        {
            await CreateAPIPackageRevenueShare(payment, pricing);
        }
    }

    // Revenue share for Data Package (split by provider row count)
    private async Task CreateDataPackageRevenueShare(Payment payment, SystemPricing pricing)
    {
        var purchase = await _context.DataPackagePurchases
            .FirstOrDefaultAsync(p => p.PurchaseId == payment.ReferenceId);

        if (purchase == null) return;

        // Query records to get provider distribution
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .ThenInclude(d => d!.DataProvider)
            .Where(r => r.ProvinceId == purchase.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (purchase.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == purchase.DistrictId.Value);
        }

        if (purchase.StartDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp >= purchase.StartDate.Value);
        }

        if (purchase.EndDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp <= purchase.EndDate.Value);
        }

        var providerDistribution = await query
            .GroupBy(r => r.Dataset!.ProviderId)
            .Select(g => new
            {
                ProviderId = g.Key,
                RowCount = g.Count()
            })
            .ToListAsync();

        var totalRows = providerDistribution.Sum(p => p.RowCount);

        foreach (var provider in providerDistribution)
        {
            var percentage = (decimal)provider.RowCount / totalRows;
            var providerAmount = payment.Amount!.Value * percentage * (pricing.ProviderCommissionPercent / 100);
            var adminAmount = payment.Amount.Value * percentage * (pricing.AdminCommissionPercent / 100);

            var revenueShare = new RevenueShare
            {
                PaymentId = payment.PaymentId,
                ProviderId = provider.ProviderId,
                TotalAmount = payment.Amount.Value * percentage,
                ProviderShare = providerAmount,
                AdminShare = adminAmount,
                CalculatedDate = DateTime.Now,
                PayoutStatus = "Pending"
            };

            _context.RevenueShares.Add(revenueShare);
        }
    }

    // Revenue share for Subscription (equal split among providers)
    private async Task CreateSubscriptionRevenueShare(Payment payment, SystemPricing pricing)
    {
        var subscription = await _context.SubscriptionPackagePurchases
            .FirstOrDefaultAsync(s => s.SubscriptionId == payment.ReferenceId);

        if (subscription == null) return;

        // Get distinct providers in the region
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == subscription.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (subscription.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == subscription.DistrictId.Value);
        }

        var providers = await query
            .Select(r => r.Dataset!.ProviderId)
            .Distinct()
            .ToListAsync();

        if (providers.Any())
        {
            var sharePerProvider = payment.Amount!.Value / providers.Count;
            var providerAmount = sharePerProvider * (pricing.ProviderCommissionPercent / 100);
            var adminAmount = sharePerProvider * (pricing.AdminCommissionPercent / 100);

            foreach (var providerId in providers)
            {
                var revenueShare = new RevenueShare
                {
                    PaymentId = payment.PaymentId,
                    ProviderId = providerId,
                    TotalAmount = sharePerProvider,
                    ProviderShare = providerAmount,
                    AdminShare = adminAmount,
                    CalculatedDate = DateTime.Now,
                    PayoutStatus = "Pending"
                };

                _context.RevenueShares.Add(revenueShare);
            }
        }
    }

    // Revenue share for API Package (equal split among providers)
    private async Task CreateAPIPackageRevenueShare(Payment payment, SystemPricing pricing)
    {
        var apiPackage = await _context.APIPackagePurchases
            .FirstOrDefaultAsync(a => a.ApiPurchaseId == payment.ReferenceId);

        if (apiPackage == null) return;

        // Get providers in scope
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (apiPackage.ProvinceId.HasValue)
        {
            query = query.Where(r => r.ProvinceId == apiPackage.ProvinceId.Value);
        }

        if (apiPackage.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == apiPackage.DistrictId.Value);
        }

        var providers = await query
            .Select(r => r.Dataset!.ProviderId)
            .Distinct()
            .ToListAsync();

        if (providers.Any())
        {
            var sharePerProvider = payment.Amount!.Value / providers.Count;
            var providerAmount = sharePerProvider * (pricing.ProviderCommissionPercent / 100);
            var adminAmount = sharePerProvider * (pricing.AdminCommissionPercent / 100);

            foreach (var providerId in providers)
            {
                var revenueShare = new RevenueShare
                {
                    PaymentId = payment.PaymentId,
                    ProviderId = providerId,
                    TotalAmount = sharePerProvider,
                    ProviderShare = providerAmount,
                    AdminShare = adminAmount,
                    CalculatedDate = DateTime.Now,
                    PayoutStatus = "Pending"
                };

                _context.RevenueShares.Add(revenueShare);
            }
        }
    }
}
