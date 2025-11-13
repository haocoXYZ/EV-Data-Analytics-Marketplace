using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;

namespace EVDataMarketplace.API.Controllers
{
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
        /// GET /api/locations/provinces
        /// Get all provinces
        /// </summary>
        [HttpGet("provinces")]
        public async Task<IActionResult> GetProvinces()
        {
            try
            {
                var provinces = await _context.Provinces
                    .OrderBy(p => p.Name)
                    .Select(p => new
                    {
                        p.ProvinceId,
                        p.Name,
                        p.Code
                    })
                    .ToListAsync();

                return Ok(provinces);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving provinces", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/locations/provinces/{id}
        /// Get province by ID
        /// </summary>
        [HttpGet("provinces/{id}")]
        public async Task<IActionResult> GetProvinceById(int id)
        {
            try
            {
                var province = await _context.Provinces
                    .Where(p => p.ProvinceId == id)
                    .Select(p => new
                    {
                        p.ProvinceId,
                        p.Name,
                        p.Code
                    })
                    .FirstOrDefaultAsync();

                if (province == null)
                {
                    return NotFound(new { message = "Province not found" });
                }

                return Ok(province);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving province", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/locations/districts
        /// Get all districts (optionally filter by provinceId)
        /// </summary>
        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts([FromQuery] int? provinceId)
        {
            try
            {
                var query = _context.Districts.AsQueryable();

                if (provinceId.HasValue)
                {
                    query = query.Where(d => d.ProvinceId == provinceId.Value);
                }

                var districts = await query
                    .OrderBy(d => d.Name)
                    .Select(d => new
                    {
                        d.DistrictId,
                        d.ProvinceId,
                        d.Name
                    })
                    .ToListAsync();

                return Ok(districts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving districts", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/locations/districts/{id}
        /// Get district by ID
        /// </summary>
        [HttpGet("districts/{id}")]
        public async Task<IActionResult> GetDistrictById(int id)
        {
            try
            {
                var district = await _context.Districts
                    .Where(d => d.DistrictId == id)
                    .Select(d => new
                    {
                        d.DistrictId,
                        d.ProvinceId,
                        d.Name
                    })
                    .FirstOrDefaultAsync();

                if (district == null)
                {
                    return NotFound(new { message = "District not found" });
                }

                return Ok(district);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving district", error = ex.Message });
            }
        }
    }
}
