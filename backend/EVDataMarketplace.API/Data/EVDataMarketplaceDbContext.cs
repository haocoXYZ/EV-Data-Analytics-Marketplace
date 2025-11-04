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
    public DbSet<SystemPricing> SystemPricings { get; set; }
    public DbSet<Dataset> Datasets { get; set; }
    public DbSet<DatasetRecord> DatasetRecords { get; set; }
    public DbSet<DatasetModeration> DatasetModerations { get; set; }

    // Purchase Packages
    public DbSet<DataPackagePurchase> DataPackagePurchases { get; set; }
    public DbSet<SubscriptionPackagePurchase> SubscriptionPackagePurchases { get; set; }
    public DbSet<APIPackagePurchase> APIPackagePurchases { get; set; }
    public DbSet<APIKey> APIKeys { get; set; }

    // Payment & Revenue
    public DbSet<Payment> Payments { get; set; }
    public DbSet<RevenueShare> RevenueShares { get; set; }
    public DbSet<Payout> Payouts { get; set; }

    // Location
    public DbSet<Province> Provinces { get; set; }
    public DbSet<District> Districts { get; set; }

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

        // DatasetRecord relationships
        modelBuilder.Entity<DatasetRecord>()
            .HasOne(dr => dr.Dataset)
            .WithMany(d => d.DatasetRecords)
            .HasForeignKey(dr => dr.DatasetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DatasetRecord>()
            .HasOne(dr => dr.Province)
            .WithMany(p => p.DatasetRecords)
            .HasForeignKey(dr => dr.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DatasetRecord>()
            .HasOne(dr => dr.District)
            .WithMany(d => d.DatasetRecords)
            .HasForeignKey(dr => dr.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DatasetRecord>()
            .HasIndex(dr => dr.DatasetId);

        modelBuilder.Entity<DatasetRecord>()
            .HasIndex(dr => new { dr.ProvinceId, dr.DistrictId });

        modelBuilder.Entity<DatasetRecord>()
            .HasIndex(dr => dr.ChargingTimestamp);

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

        // District relationships
        modelBuilder.Entity<District>()
            .HasOne(d => d.Province)
            .WithMany(p => p.Districts)
            .HasForeignKey(d => d.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        // DataPackagePurchase relationships
        modelBuilder.Entity<DataPackagePurchase>()
            .HasOne(dp => dp.DataConsumer)
            .WithMany(dc => dc.DataPackagePurchases)
            .HasForeignKey(dp => dp.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DataPackagePurchase>()
            .HasOne(dp => dp.Province)
            .WithMany(p => p.DataPackagePurchases)
            .HasForeignKey(dp => dp.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DataPackagePurchase>()
            .HasOne(dp => dp.District)
            .WithMany()
            .HasForeignKey(dp => dp.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubscriptionPackagePurchase relationships
        modelBuilder.Entity<SubscriptionPackagePurchase>()
            .HasOne(sp => sp.DataConsumer)
            .WithMany(dc => dc.SubscriptionPackagePurchases)
            .HasForeignKey(sp => sp.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubscriptionPackagePurchase>()
            .HasOne(sp => sp.Province)
            .WithMany(p => p.SubscriptionPackagePurchases)
            .HasForeignKey(sp => sp.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubscriptionPackagePurchase>()
            .HasOne(sp => sp.District)
            .WithMany()
            .HasForeignKey(sp => sp.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        // APIPackagePurchase relationships
        modelBuilder.Entity<APIPackagePurchase>()
            .HasOne(ap => ap.DataConsumer)
            .WithMany(dc => dc.APIPackagePurchases)
            .HasForeignKey(ap => ap.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIPackagePurchase>()
            .HasOne(ap => ap.Province)
            .WithMany(p => p.APIPackagePurchases)
            .HasForeignKey(ap => ap.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIPackagePurchase>()
            .HasOne(ap => ap.District)
            .WithMany()
            .HasForeignKey(ap => ap.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        // APIKey relationships
        modelBuilder.Entity<APIKey>()
            .HasOne(ak => ak.APIPackagePurchase)
            .WithMany(ap => ap.APIKeys)
            .HasForeignKey(ak => ak.ApiPurchaseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIKey>()
            .HasOne(ak => ak.DataConsumer)
            .WithMany(dc => dc.APIKeys)
            .HasForeignKey(ak => ak.ConsumerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APIKey>()
            .HasIndex(ak => ak.KeyValue)
            .IsUnique();

        // Decimal precision configuration for new models
        // SystemPricing
        modelBuilder.Entity<SystemPricing>()
            .Property(sp => sp.PricePerRow)
            .HasPrecision(18, 4);

        modelBuilder.Entity<SystemPricing>()
            .Property(sp => sp.SubscriptionMonthlyBase)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SystemPricing>()
            .Property(sp => sp.ApiPricePerCall)
            .HasPrecision(18, 4);

        modelBuilder.Entity<SystemPricing>()
            .Property(sp => sp.ProviderCommissionPercent)
            .HasPrecision(5, 2);

        modelBuilder.Entity<SystemPricing>()
            .Property(sp => sp.AdminCommissionPercent)
            .HasPrecision(5, 2);

        // DataPackagePurchase
        modelBuilder.Entity<DataPackagePurchase>()
            .Property(dp => dp.PricePerRow)
            .HasPrecision(18, 4);

        modelBuilder.Entity<DataPackagePurchase>()
            .Property(dp => dp.TotalPrice)
            .HasPrecision(18, 2);

        // SubscriptionPackagePurchase
        modelBuilder.Entity<SubscriptionPackagePurchase>()
            .Property(sp => sp.MonthlyPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SubscriptionPackagePurchase>()
            .Property(sp => sp.TotalPaid)
            .HasPrecision(18, 2);

        // APIPackagePurchase
        modelBuilder.Entity<APIPackagePurchase>()
            .Property(ap => ap.PricePerCall)
            .HasPrecision(18, 4);

        modelBuilder.Entity<APIPackagePurchase>()
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
    }
}
