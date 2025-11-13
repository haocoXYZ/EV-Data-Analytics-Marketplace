using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Base authorization - all authenticated users
public class PricingController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public PricingController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all system pricing (accessible to all authenticated users)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPricing()
    {
        var pricings = await _context.SystemPricings
            .OrderBy(p => p.PackageType)
            .Select(p => new
            {
                pricingId = p.PricingId,
                packageType = p.PackageType,
                description = p.Description,
                pricePerRow = p.PricePerRow,
                subscriptionMonthlyBase = p.SubscriptionMonthlyBase,
                apiPricePerCall = p.ApiPricePerCall,
                providerCommissionPercent = p.ProviderCommissionPercent,
                adminCommissionPercent = p.AdminCommissionPercent,
                isActive = p.IsActive,
                createdAt = p.CreatedAt,
                updatedAt = p.UpdatedAt
            })
            .ToListAsync();

        return Ok(pricings);
    }

    /// <summary>
    /// Get pricing by ID (accessible to all authenticated users)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPricingById(int id)
    {
        var pricing = await _context.SystemPricings.FindAsync(id);

        if (pricing == null)
        {
            return NotFound(new { message = "Pricing not found" });
        }

        return Ok(new
        {
            pricingId = pricing.PricingId,
            packageType = pricing.PackageType,
            description = pricing.Description,
            pricePerRow = pricing.PricePerRow,
            subscriptionMonthlyBase = pricing.SubscriptionMonthlyBase,
            apiPricePerCall = pricing.ApiPricePerCall,
            providerCommissionPercent = pricing.ProviderCommissionPercent,
            adminCommissionPercent = pricing.AdminCommissionPercent,
            isActive = pricing.IsActive,
            createdAt = pricing.CreatedAt,
            updatedAt = pricing.UpdatedAt
        });
    }

    /// <summary>
    /// Update pricing (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePricing(int id, [FromBody] UpdatePricingDto dto)
    {
        Console.WriteLine($"[DEBUG] UpdatePricing ID={id}");
        Console.WriteLine($"[DEBUG] PricePerRow: {dto.PricePerRow}");
        Console.WriteLine($"[DEBUG] SubscriptionMonthlyBase: {dto.SubscriptionMonthlyBase}");
        Console.WriteLine($"[DEBUG] ApiPricePerCall: {dto.ApiPricePerCall}");
        Console.WriteLine($"[DEBUG] ProviderCommission: {dto.ProviderCommissionPercent}");
        Console.WriteLine($"[DEBUG] AdminCommission: {dto.AdminCommissionPercent}");

        var pricing = await _context.SystemPricings.FindAsync(id);

        if (pricing == null)
        {
            return NotFound(new { message = "Pricing not found" });
        }

        // Update fields if provided
        if (dto.PricePerRow.HasValue)
        {
            pricing.PricePerRow = dto.PricePerRow.Value;
        }

        if (dto.SubscriptionMonthlyBase.HasValue)
        {
            pricing.SubscriptionMonthlyBase = dto.SubscriptionMonthlyBase.Value;
        }

        if (dto.ApiPricePerCall.HasValue)
        {
            pricing.ApiPricePerCall = dto.ApiPricePerCall.Value;
        }

        if (dto.ProviderCommissionPercent.HasValue)
        {
            pricing.ProviderCommissionPercent = dto.ProviderCommissionPercent.Value;
        }

        if (dto.AdminCommissionPercent.HasValue)
        {
            pricing.AdminCommissionPercent = dto.AdminCommissionPercent.Value;
        }

        // Validate commission percentages sum to 100 (only if at least one was updated)
        if (dto.ProviderCommissionPercent.HasValue || dto.AdminCommissionPercent.HasValue)
        {
            if (pricing.ProviderCommissionPercent + pricing.AdminCommissionPercent != 100)
            {
                return BadRequest(new
                {
                    message = "Provider and Admin commission percentages must sum to 100%",
                    providerPercent = pricing.ProviderCommissionPercent,
                    adminPercent = pricing.AdminCommissionPercent,
                    sum = pricing.ProviderCommissionPercent + pricing.AdminCommissionPercent
                });
            }
        }

        pricing.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Pricing updated successfully",
            pricing = new
            {
                pricingId = pricing.PricingId,
                packageType = pricing.PackageType,
                pricePerRow = pricing.PricePerRow,
                subscriptionMonthlyBase = pricing.SubscriptionMonthlyBase,
                apiPricePerCall = pricing.ApiPricePerCall,
                providerCommissionPercent = pricing.ProviderCommissionPercent,
                adminCommissionPercent = pricing.AdminCommissionPercent,
                updatedAt = pricing.UpdatedAt
            }
        });
    }

    /// <summary>
    /// Toggle pricing active status (Admin only)
    /// </summary>
    [HttpPatch("{id}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var pricing = await _context.SystemPricings.FindAsync(id);

        if (pricing == null)
        {
            return NotFound(new { message = "Pricing not found" });
        }

        pricing.IsActive = !pricing.IsActive;
        pricing.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Pricing {(pricing.IsActive ? "activated" : "deactivated")} successfully",
            pricingId = pricing.PricingId,
            isActive = pricing.IsActive
        });
    }
}
