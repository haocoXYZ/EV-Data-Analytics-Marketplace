using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Data;

public class EVDataMarketplaceDbContext : DbContext
{
    public EVDataMarketplaceDbContext(DbContextOptions<EVDataMarketplaceDbContext> options)
        : base(options)
    {
    }

    // User Management
    public DbSet<User> Users { get; set; }
    public DbSet<DataProvider> DataProviders { get; set; }
    public DbSet<DataConsumer> DataConsumers { get; set; }

    // Pricing & Dataset
    public DbSet<PricingTier> PricingTiers { get; set; }
    public DbSet<Dataset> Datasets { get; set; }
    public DbSet<DatasetRecord> DatasetRecords { get; set; }
    public DbSet<DatasetModeration> DatasetModerations { get; set; }

    // Purchase Packages
    public DbSet<OneTimePurchase> OneTimePurchases { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<APIPackage> APIPackages { get; set; }

    // Payment & Revenue
    public DbSet<Payment> Payments { get; set; }
    public DbSet<RevenueShare> RevenueShares { get; set; }
    public DbSet<Payout> Payouts { get; set; }

    // Location
    public DbSet<Province> Provinces { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User - DataProvider (One-to-One)
        modelBuilder.Entity<User>()
            .HasOne(u => u.DataProvider)
            .WithOne(dp => dp.User)
            .HasForeignKey<DataProvider>(dp => dp.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // User - DataConsumer (One-to-One)
        modelBuilder.Entity<User>()
            .HasOne(u => u.DataConsumer)
            .WithOne(dc => dc.User)
            .HasForeignKey<DataConsumer>(dc => dc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Dataset relationships
        modelBuilder.Entity<Dataset>()
            .HasOne(d => d.DataProvider)
            .WithMany(dp => dp.Datasets)
            .HasForeignKey(d => d.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Dataset>()
            .HasOne(d => d.PricingTier)
            .WithMany(pt => pt.Datasets)
            .HasForeignKey(d => d.TierId)
            .OnDelete(DeleteBehavior.Restrict);

        // DatasetRecord relationships
        modelBuilder.Entity<DatasetRecord>()
            .HasOne(dr => dr.Dataset)
            .WithMany(d => d.DatasetRecords)
            .HasForeignKey(dr => dr.DatasetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DatasetRecord>()
            .HasIndex(dr => dr.DatasetId);

        // DatasetModeration relationships
        modelBuilder.Entity<DatasetModeration>()
            .HasOne(dm => dm.Dataset)
            .WithMany(d => d.DatasetModerations)
            .HasForeignKey(dm => dm.DatasetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DatasetModeration>()
            .HasOne(dm => dm.Moderator)
            .WithMany(u => u.DatasetModerations)
            .HasForeignKey(dm => dm.ModeratorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Purchase relationships
        modelBuilder.Entity<OneTimePurchase>()
            .HasOne(otp => otp.Dataset)
            .WithMany(d => d.OneTimePurchases)
            .HasForeignKey(otp => otp.DatasetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OneTimePurchase>()
            .HasOne(otp => otp.DataConsumer)
            .WithMany(dc => dc.OneTimePurchases)
            .HasForeignKey(otp => otp.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Dataset)
            .WithMany(d => d.Subscriptions)
            .HasForeignKey(s => s.DatasetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.DataConsumer)
            .WithMany(dc => dc.Subscriptions)
            .HasForeignKey(s => s.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Province)
            .WithMany(p => p.Subscriptions)
            .HasForeignKey(s => s.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIPackage>()
            .HasOne(ap => ap.Dataset)
            .WithMany(d => d.APIPackages)
            .HasForeignKey(ap => ap.DatasetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIPackage>()
            .HasOne(ap => ap.DataConsumer)
            .WithMany(dc => dc.APIPackages)
            .HasForeignKey(ap => ap.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Payment relationships
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.DataConsumer)
            .WithMany(dc => dc.Payments)
            .HasForeignKey(p => p.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        // RevenueShare relationships
        modelBuilder.Entity<RevenueShare>()
            .HasOne(rs => rs.Payment)
            .WithMany(p => p.RevenueShares)
            .HasForeignKey(rs => rs.PaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RevenueShare>()
            .HasOne(rs => rs.DataProvider)
            .WithMany(dp => dp.RevenueShares)
            .HasForeignKey(rs => rs.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Payout relationships
        modelBuilder.Entity<Payout>()
            .HasOne(p => p.DataProvider)
            .WithMany(dp => dp.Payouts)
            .HasForeignKey(p => p.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Decimal precision configuration
        modelBuilder.Entity<PricingTier>()
            .Property(pt => pt.BasePricePerMb)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PricingTier>()
            .Property(pt => pt.ApiPricePerCall)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PricingTier>()
            .Property(pt => pt.SubscriptionPricePerRegion)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PricingTier>()
            .Property(pt => pt.ProviderCommissionPercent)
            .HasPrecision(5, 2);

        modelBuilder.Entity<PricingTier>()
            .Property(pt => pt.AdminCommissionPercent)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Dataset>()
            .Property(d => d.DataSizeMb)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OneTimePurchase>()
            .Property(otp => otp.TotalPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Subscription>()
            .Property(s => s.TotalPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<APIPackage>()
            .Property(ap => ap.PricePerCall)
            .HasPrecision(18, 2);

        modelBuilder.Entity<APIPackage>()
            .Property(ap => ap.TotalPaid)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RevenueShare>()
            .Property(rs => rs.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RevenueShare>()
            .Property(rs => rs.ProviderShare)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RevenueShare>()
            .Property(rs => rs.AdminShare)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payout>()
            .Property(p => p.TotalDue)
            .HasPrecision(18, 2);

        // Indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        modelBuilder.Entity<Dataset>()
            .HasIndex(d => d.Status);

        modelBuilder.Entity<Dataset>()
            .HasIndex(d => d.Category);

        modelBuilder.Entity<Dataset>()
            .HasIndex(d => d.ModerationStatus);

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.Status);

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.PaymentDate);

        modelBuilder.Entity<APIPackage>()
            .HasIndex(ap => ap.ApiKey)
            .IsUnique();
    }
}
