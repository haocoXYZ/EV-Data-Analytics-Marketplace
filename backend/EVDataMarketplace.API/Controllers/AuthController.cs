using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Services;

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
}
