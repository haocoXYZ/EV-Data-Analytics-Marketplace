using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Services;
using System.Security.Claims;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IAuthService _authService;

    public AuthController(EVDataMarketplaceDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Validate role
        if (request.Role != "DataProvider" && request.Role != "DataConsumer")
        {
            return BadRequest(new { message = "Invalid role. Must be DataProvider or DataConsumer" });
        }

        // Create user
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Password = _authService.HashPassword(request.Password),
            Role = request.Role,
            Status = "Active",
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create DataProvider or DataConsumer profile
        if (request.Role == "DataProvider")
        {
            var provider = new DataProvider
            {
                UserId = user.UserId,
                CompanyName = request.CompanyName ?? request.FullName,
                CompanyWebsite = request.CompanyWebsite,
                ContactEmail = request.Email,
                CreatedAt = DateTime.Now
            };
            _context.DataProviders.Add(provider);
        }
        else if (request.Role == "DataConsumer")
        {
            var consumer = new DataConsumer
            {
                UserId = user.UserId,
                OrganizationName = request.OrganizationName ?? request.FullName,
                BillingEmail = request.Email,
                CreatedAt = DateTime.Now
            };
            _context.DataConsumers.Add(consumer);
        }

        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = _authService.GenerateJwtToken(user);
        var expiryMinutes = int.Parse(HttpContext.RequestServices.GetRequiredService<IConfiguration>()
            .GetSection("JwtSettings")["ExpiryInMinutes"] ?? "1440");

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password
            if (!_authService.VerifyPassword(request.Password, user.Password))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Check if user is active
            if (user.Status != "Active")
            {
                return Unauthorized(new { message = "Account is not active" });
            }

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            var expiryMinutes = int.Parse(HttpContext.RequestServices.GetRequiredService<IConfiguration>()
                .GetSection("JwtSettings")["ExpiryInMinutes"] ?? "1440");

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    /// <summary>
    /// GET: api/auth/profile - Get current user's profile with provider/consumer ID
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult> GetProfile()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found in token" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == userEmail);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Base profile info
        var profile = new
        {
            userId = user.UserId,
            fullName = user.FullName,
            email = user.Email,
            role = user.Role,
            status = user.Status,
            createdAt = user.CreatedAt
        };

        // Get role-specific profile
        if (user.Role == "DataProvider")
        {
            var provider = await _context.DataProviders
                .Include(p => p.Province)
                .FirstOrDefaultAsync(p => p.UserId == user.UserId);

            if (provider != null)
            {
                return Ok(new
                {
                    user = profile,
                    provider = new
                    {
                        providerId = provider.ProviderId,
                        companyName = provider.CompanyName,
                        companyWebsite = provider.CompanyWebsite,
                        contactEmail = provider.ContactEmail,
                        contactPhone = provider.ContactPhone,
                        address = provider.Address,
                        provinceId = provider.ProvinceId,
                        provinceName = provider.Province?.Name
                    }
                });
            }
        }
        else if (user.Role == "DataConsumer")
        {
            var consumer = await _context.DataConsumers
                .FirstOrDefaultAsync(c => c.UserId == user.UserId);

            if (consumer != null)
            {
                return Ok(new
                {
                    user = profile,
                    consumer = new
                    {
                        consumerId = consumer.ConsumerId,
                        organizationName = consumer.OrganizationName,
                        contactPerson = consumer.ContactPerson,
                        contactNumber = consumer.ContactNumber,
                        billingEmail = consumer.BillingEmail
                    }
                });
            }
        }

        // For Admin/Moderator or if profile not found
        return Ok(new { user = profile });
    }
}
