using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public LocationsController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all provinces
    /// </summary>
    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        var provinces = await _context.Provinces
            .OrderBy(p => p.Name)
            .Select(p => new
            {
                provinceId = p.ProvinceId,
                name = p.Name,
                code = p.Code
            })
            .ToListAsync();

        return Ok(provinces);
    }

    /// <summary>
    /// Get a specific province by ID
    /// </summary>
    [HttpGet("provinces/{id}")]
    public async Task<IActionResult> GetProvince(int id)
    {
        var province = await _context.Provinces
            .Where(p => p.ProvinceId == id)
            .Select(p => new
            {
                provinceId = p.ProvinceId,
                name = p.Name,
                code = p.Code
            })
            .FirstOrDefaultAsync();

        if (province == null)
        {
            return NotFound(new { message = "Province not found" });
        }

        return Ok(province);
    }

    /// <summary>
    /// Get all districts for a specific province
    /// </summary>
    [HttpGet("provinces/{provinceId}/districts")]
    public async Task<IActionResult> GetDistrictsByProvince(int provinceId)
    {
        // Verify province exists
        var provinceExists = await _context.Provinces
            .AnyAsync(p => p.ProvinceId == provinceId);

        if (!provinceExists)
        {
            return NotFound(new { message = "Province not found" });
        }

        var districts = await _context.Districts
            .Where(d => d.ProvinceId == provinceId)
            .OrderBy(d => d.Name)
            .Select(d => new
            {
                districtId = d.DistrictId,
                provinceId = d.ProvinceId,
                name = d.Name,
                type = d.Type
            })
            .ToListAsync();

        return Ok(districts);
    }

    /// <summary>
    /// Get all districts (all provinces)
    /// </summary>
    [HttpGet("districts")]
    public async Task<IActionResult> GetAllDistricts([FromQuery] int? provinceId = null)
    {
        var query = _context.Districts.AsQueryable();

        if (provinceId.HasValue)
        {
            query = query.Where(d => d.ProvinceId == provinceId.Value);
        }

        var districts = await query
            .OrderBy(d => d.ProvinceId)
            .ThenBy(d => d.Name)
            .Select(d => new
            {
                districtId = d.DistrictId,
                provinceId = d.ProvinceId,
                name = d.Name,
                type = d.Type
            })
            .ToListAsync();

        return Ok(districts);
    }

    /// <summary>
    /// Get a specific district by ID
    /// </summary>
    [HttpGet("districts/{id}")]
    public async Task<IActionResult> GetDistrict(int id)
    {
        var district = await _context.Districts
            .Include(d => d.Province)
            .Where(d => d.DistrictId == id)
            .Select(d => new
            {
                districtId = d.DistrictId,
                provinceId = d.ProvinceId,
                provinceName = d.Province != null ? d.Province.Name : "Unknown",
                name = d.Name,
                type = d.Type
            })
            .FirstOrDefaultAsync();

        if (district == null)
        {
            return NotFound(new { message = "District not found" });
        }

        return Ok(district);
    }

    /// <summary>
    /// Get location statistics (for admin/analytics)
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetLocationStats()
    {
        var totalProvinces = await _context.Provinces.CountAsync();
        var totalDistricts = await _context.Districts.CountAsync();

        // Get provinces with district counts
        var provincesWithCounts = await _context.Provinces
            .Select(p => new
            {
                provinceId = p.ProvinceId,
                provinceName = p.Name,
                districtCount = _context.Districts.Count(d => d.ProvinceId == p.ProvinceId)
            })
            .Where(p => p.districtCount > 0)
            .OrderByDescending(p => p.districtCount)
            .ToListAsync();

        return Ok(new
        {
            totalProvinces,
            totalDistricts,
            provincesWithDistricts = provincesWithCounts.Count,
            topProvinces = provincesWithCounts.Take(5)
        });
    }
}
