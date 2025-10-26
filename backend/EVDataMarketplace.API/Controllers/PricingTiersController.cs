using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Controllers;

// B1: Admin cung cap bang gia cho cac muc thong tin khac nhau
[ApiController]
[Route("api/[controller]")]
public class PricingTiersController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public PricingTiersController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    // GET: api/pricingtiers - Public, cho Provider xem gia
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PricingTierDto>>> GetPricingTiers()
    {
        var tiers = await _context.PricingTiers
            .Where(t => t.IsActive)
            .Select(t => new PricingTierDto
            {
                TierId = t.TierId,
                TierName = t.TierName,
                Description = t.Description,
                BasePricePerMb = t.BasePricePerMb,
                ApiPricePerCall = t.ApiPricePerCall,
                SubscriptionPricePerRegion = t.SubscriptionPricePerRegion,
                ProviderCommissionPercent = t.ProviderCommissionPercent,
                AdminCommissionPercent = t.AdminCommissionPercent,
                IsActive = t.IsActive
            })
            .ToListAsync();

        return Ok(tiers);
    }

    // GET: api/pricingtiers/5
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<PricingTierDto>> GetPricingTier(int id)
    {
        var tier = await _context.PricingTiers.FindAsync(id);

        if (tier == null)
        {
            return NotFound();
        }

        return Ok(new PricingTierDto
        {
            TierId = tier.TierId,
            TierName = tier.TierName,
            Description = tier.Description,
            BasePricePerMb = tier.BasePricePerMb,
            ApiPricePerCall = tier.ApiPricePerCall,
            SubscriptionPricePerRegion = tier.SubscriptionPricePerRegion,
            ProviderCommissionPercent = tier.ProviderCommissionPercent,
            AdminCommissionPercent = tier.AdminCommissionPercent,
            IsActive = tier.IsActive
        });
    }

    // POST: api/pricingtiers - Admin only
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<PricingTierDto>> CreatePricingTier([FromBody] PricingTierCreateDto request)
    {
        var tier = new PricingTier
        {
            TierName = request.TierName,
            Description = request.Description,
            BasePricePerMb = request.BasePricePerMb,
            ApiPricePerCall = request.ApiPricePerCall,
            SubscriptionPricePerRegion = request.SubscriptionPricePerRegion,
            ProviderCommissionPercent = request.ProviderCommissionPercent,
            AdminCommissionPercent = request.AdminCommissionPercent,
            IsActive = true,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _context.PricingTiers.Add(tier);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPricingTier), new { id = tier.TierId }, new PricingTierDto
        {
            TierId = tier.TierId,
            TierName = tier.TierName,
            Description = tier.Description,
            BasePricePerMb = tier.BasePricePerMb,
            ApiPricePerCall = tier.ApiPricePerCall,
            SubscriptionPricePerRegion = tier.SubscriptionPricePerRegion,
            ProviderCommissionPercent = tier.ProviderCommissionPercent,
            AdminCommissionPercent = tier.AdminCommissionPercent,
            IsActive = tier.IsActive
        });
    }

    // PUT: api/pricingtiers/5 - Admin only
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePricingTier(int id, [FromBody] PricingTierCreateDto request)
    {
        var tier = await _context.PricingTiers.FindAsync(id);

        if (tier == null)
        {
            return NotFound();
        }

        tier.TierName = request.TierName;
        tier.Description = request.Description;
        tier.BasePricePerMb = request.BasePricePerMb;
        tier.ApiPricePerCall = request.ApiPricePerCall;
        tier.SubscriptionPricePerRegion = request.SubscriptionPricePerRegion;
        tier.ProviderCommissionPercent = request.ProviderCommissionPercent;
        tier.AdminCommissionPercent = request.AdminCommissionPercent;
        tier.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/pricingtiers/5 - Admin only (soft delete)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePricingTier(int id)
    {
        var tier = await _context.PricingTiers.FindAsync(id);

        if (tier == null)
        {
            return NotFound();
        }

        tier.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
