using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Data;

public static class DbSeeder
{
    public static void SeedData(EVDataMarketplaceDbContext context)
    {
        // Seed Provinces
        if (!context.Provinces.Any())
        {
            var provinces = new List<Province>
            {
                new Province { Name = "Hà Nội" },
                new Province { Name = "TP Hồ Chí Minh" },
                new Province { Name = "Đà Nẵng" },
                new Province { Name = "Hải Phòng" },
                new Province { Name = "Cần Thơ" },
                new Province { Name = "Bình Dương" },
                new Province { Name = "Đồng Nai" },
                new Province { Name = "Khánh Hòa" }
            };
            context.Provinces.AddRange(provinces);
            context.SaveChanges();
        }

        // Seed Admin User
        if (!context.Users.Any(u => u.Role == "Admin"))
        {
            var adminPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            var admin = new User
            {
                FullName = "System Administrator",
                Email = "admin@evdatamarket.com",
                Password = adminPassword,
                Role = "Admin",
                Status = "Active",
                CreatedAt = DateTime.Now
            };
            context.Users.Add(admin);
            context.SaveChanges();
        }

        // Seed Moderator User
        if (!context.Users.Any(u => u.Role == "Moderator"))
        {
            var moderatorPassword = BCrypt.Net.BCrypt.HashPassword("Moderator@123");
            var moderator = new User
            {
                FullName = "Content Moderator",
                Email = "moderator@evdatamarket.com",
                Password = moderatorPassword,
                Role = "Moderator",
                Status = "Active",
                CreatedAt = DateTime.Now
            };
            context.Users.Add(moderator);
            context.SaveChanges();
        }

        // Seed Pricing Tiers
        if (!context.PricingTiers.Any())
        {
            var pricingTiers = new List<PricingTier>
            {
                new PricingTier
                {
                    TierName = "Basic",
                    Description = "Gói cơ bản cho dữ liệu thông thường",
                    BasePricePerMb = 0.3m,
                    ApiPricePerCall = 0.05m,
                    SubscriptionPricePerRegion = 500m,
                    ProviderCommissionPercent = 65m,
                    AdminCommissionPercent = 35m,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new PricingTier
                {
                    TierName = "Standard",
                    Description = "Gói tiêu chuẩn cho dữ liệu chất lượng cao",
                    BasePricePerMb = 0.5m,
                    ApiPricePerCall = 0.1m,
                    SubscriptionPricePerRegion = 1000m,
                    ProviderCommissionPercent = 70m,
                    AdminCommissionPercent = 30m,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new PricingTier
                {
                    TierName = "Premium",
                    Description = "Gói cao cấp cho dữ liệu real-time và phân tích sâu",
                    BasePricePerMb = 1.0m,
                    ApiPricePerCall = 0.2m,
                    SubscriptionPricePerRegion = 2000m,
                    ProviderCommissionPercent = 75m,
                    AdminCommissionPercent = 25m,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                }
            };
            context.PricingTiers.AddRange(pricingTiers);
            context.SaveChanges();
        }

        // Seed Sample Data Providers
        if (!context.DataProviders.Any())
        {
            var providerUsers = new List<User>
            {
                new User
                {
                    FullName = "VinFast Charging",
                    Email = "provider1@vinfast.vn",
                    Password = BCrypt.Net.BCrypt.HashPassword("Provider@123"),
                    Role = "DataProvider",
                    Status = "Active",
                    CreatedAt = DateTime.Now
                },
                new User
                {
                    FullName = "EVN Charging Network",
                    Email = "provider2@evn.vn",
                    Password = BCrypt.Net.BCrypt.HashPassword("Provider@123"),
                    Role = "DataProvider",
                    Status = "Active",
                    CreatedAt = DateTime.Now
                },
                new User
                {
                    FullName = "GreenCharge Vietnam",
                    Email = "provider3@greencharge.vn",
                    Password = BCrypt.Net.BCrypt.HashPassword("Provider@123"),
                    Role = "DataProvider",
                    Status = "Active",
                    CreatedAt = DateTime.Now
                }
            };

            context.Users.AddRange(providerUsers);
            context.SaveChanges();

            var provinces = context.Provinces.ToList();
            var haNoi = provinces.First(p => p.Name == "Hà Nội");
            var hcm = provinces.First(p => p.Name == "TP Hồ Chí Minh");
            var daNang = provinces.First(p => p.Name == "Đà Nẵng");

            var providers = new List<DataProvider>
            {
                new DataProvider
                {
                    UserId = providerUsers[0].UserId,
                    CompanyName = "VinFast Charging",
                    CompanyWebsite = "https://vinfastcharging.vn",
                    ContactEmail = "provider1@vinfast.vn",
                    ContactPhone = "0901234567",
                    Address = "Hà Nội, Việt Nam",
                    ProvinceId = haNoi.ProvinceId,
                    CreatedAt = DateTime.Now
                },
                new DataProvider
                {
                    UserId = providerUsers[1].UserId,
                    CompanyName = "EVN Charging Network",
                    CompanyWebsite = "https://evncharging.vn",
                    ContactEmail = "provider2@evn.vn",
                    ContactPhone = "0902345678",
                    Address = "TP Hồ Chí Minh, Việt Nam",
                    ProvinceId = hcm.ProvinceId,
                    CreatedAt = DateTime.Now
                },
                new DataProvider
                {
                    UserId = providerUsers[2].UserId,
                    CompanyName = "GreenCharge Vietnam",
                    CompanyWebsite = "https://greencharge.vn",
                    ContactEmail = "provider3@greencharge.vn",
                    ContactPhone = "0903456789",
                    Address = "Đà Nẵng, Việt Nam",
                    ProvinceId = daNang.ProvinceId,
                    CreatedAt = DateTime.Now
                }
            };

            context.DataProviders.AddRange(providers);
            context.SaveChanges();

            // Seed Sample Datasets
            var standardTier = context.PricingTiers.First(t => t.TierName == "Standard");
            var basicTier = context.PricingTiers.First(t => t.TierName == "Basic");

            var datasets = new List<Dataset>
            {
                new Dataset
                {
                    ProviderId = providers[0].ProviderId,
                    TierId = standardTier.TierId,
                    Name = "Dữ liệu sạc xe điện Hà Nội Q1/2025",
                    Description = "Dữ liệu chi tiết về các phiên sạc xe điện tại Hà Nội trong quý 1 năm 2025, bao gồm thời gian sạc, năng lượng tiêu thụ, loại xe",
                    Category = "Charging Session",
                    DataFormat = "CSV",
                    DataSizeMb = 150.5m,
                    UploadDate = DateTime.Now.AddDays(-5),
                    LastUpdated = DateTime.Now.AddDays(-5),
                    Status = "Active",
                    Visibility = "Public",
                    ModerationStatus = "Approved"
                },
                new Dataset
                {
                    ProviderId = providers[1].ProviderId,
                    TierId = standardTier.TierId,
                    Name = "Phân tích hiệu suất pin xe điện TP.HCM",
                    Description = "Dữ liệu về trạng thái sức khỏe pin (SoH), tần suất sạc, và mức tiêu hao năng lượng của các xe điện tại TP.HCM",
                    Category = "Battery Performance",
                    DataFormat = "CSV",
                    DataSizeMb = 200.3m,
                    UploadDate = DateTime.Now.AddDays(-3),
                    LastUpdated = DateTime.Now.AddDays(-3),
                    Status = "Active",
                    Visibility = "Public",
                    ModerationStatus = "Approved"
                },
                new Dataset
                {
                    ProviderId = providers[2].ProviderId,
                    TierId = basicTier.TierId,
                    Name = "Dữ liệu trạm sạc Đà Nẵng 2024",
                    Description = "Thông tin về vị trí, công suất, và tình trạng hoạt động của các trạm sạc xe điện tại Đà Nẵng",
                    Category = "Charging Station",
                    DataFormat = "CSV",
                    DataSizeMb = 50.0m,
                    UploadDate = DateTime.Now.AddDays(-7),
                    LastUpdated = DateTime.Now.AddDays(-7),
                    Status = "Active",
                    Visibility = "Public",
                    ModerationStatus = "Approved"
                },
                new Dataset
                {
                    ProviderId = providers[0].ProviderId,
                    TierId = standardTier.TierId,
                    Name = "Hành vi lái xe điện miền Bắc",
                    Description = "Dữ liệu về thói quen lái xe, quãng đường di chuyển, và mức tiêu thụ năng lượng của người dùng xe điện khu vực miền Bắc",
                    Category = "Driving Behavior",
                    DataFormat = "CSV",
                    DataSizeMb = 120.0m,
                    UploadDate = DateTime.Now.AddDays(-1),
                    LastUpdated = DateTime.Now.AddDays(-1),
                    Status = "Pending",
                    Visibility = "Private",
                    ModerationStatus = "Pending"
                }
            };

            context.Datasets.AddRange(datasets);
            context.SaveChanges();
        }

        // Seed Sample Data Consumers
        if (!context.DataConsumers.Any())
        {
            var consumerUsers = new List<User>
            {
                new User
                {
                    FullName = "Toyota Research Vietnam",
                    Email = "consumer1@toyota.vn",
                    Password = BCrypt.Net.BCrypt.HashPassword("Consumer@123"),
                    Role = "DataConsumer",
                    Status = "Active",
                    CreatedAt = DateTime.Now
                },
                new User
                {
                    FullName = "EV Analytics Startup",
                    Email = "consumer2@evanalytics.vn",
                    Password = BCrypt.Net.BCrypt.HashPassword("Consumer@123"),
                    Role = "DataConsumer",
                    Status = "Active",
                    CreatedAt = DateTime.Now
                }
            };

            context.Users.AddRange(consumerUsers);
            context.SaveChanges();

            var consumers = new List<DataConsumer>
            {
                new DataConsumer
                {
                    UserId = consumerUsers[0].UserId,
                    OrganizationName = "Toyota Research Vietnam",
                    ContactPerson = "Nguyễn Văn A",
                    ContactNumber = "0911111111",
                    BillingEmail = "consumer1@toyota.vn",
                    CreatedAt = DateTime.Now
                },
                new DataConsumer
                {
                    UserId = consumerUsers[1].UserId,
                    OrganizationName = "EV Analytics Startup",
                    ContactPerson = "Trần Thị B",
                    ContactNumber = "0922222222",
                    BillingEmail = "consumer2@evanalytics.vn",
                    CreatedAt = DateTime.Now
                }
            };

            context.DataConsumers.AddRange(consumers);
            context.SaveChanges();

            // Seed Sample DatasetRecords for testing
            if (!context.DatasetRecords.Any())
            {
                var approvedDatasets = context.Datasets
                    .Where(d => d.ModerationStatus == "Approved" && d.Status == "Active")
                    .ToList();

                var sampleRecords = new List<DatasetRecord>();

                // Add sample records for each approved dataset
                foreach (var dataset in approvedDatasets)
                {
                    for (int i = 0; i < 10; i++)
                    {
                        var recordData = $$"""
                        {
                            "session_id": "{{Guid.NewGuid()}}",
                            "timestamp": "{{DateTime.Now.AddMinutes(-i * 15).ToString("yyyy-MM-dd HH:mm:ss")}}",
                            "charging_station_id": "STATION-{{i + 1:000}}",
                            "location": "{{dataset.Category}} Location {{i + 1}}",
                            "energy_delivered_kwh": {{5.5 + i * 0.3}},
                            "duration_minutes": {{20 + i * 2}},
                            "vehicle_type": "EV{{i % 3 + 1}}",
                            "battery_level_start": {{80 + i}},
                            "battery_level_end": {{95 + i}},
                            "temperature": {{25 + i * 0.5}},
                            "payment_method": "{{(i % 2 == 0 ? "Credit Card" : "Subscription")}}",
                            "cost": {{100000 + i * 5000}}
                        }
                        """;

                        sampleRecords.Add(new DatasetRecord
                        {
                            DatasetId = dataset.DatasetId,
                            RecordData = recordData,
                            RowNumber = i + 1,
                            CreatedAt = DateTime.Now.AddMinutes(-i * 15)
                        });
                    }
                }

                context.DatasetRecords.AddRange(sampleRecords);
                context.SaveChanges();
            }
        }
    }
}
