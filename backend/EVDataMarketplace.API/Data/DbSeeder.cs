using EVDataMarketplace.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EVDataMarketplace.API.Data;

public static class DbSeeder
{
    public static void SeedData(EVDataMarketplaceDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Seed Provinces
        if (!context.Provinces.Any())
        {
            SeedProvinces(context);
        }

        // Seed Districts
        if (!context.Districts.Any())
        {
            SeedDistricts(context);
        }

        // Seed System Pricing
        if (!context.SystemPricings.Any())
        {
            SeedSystemPricing(context);
        }

        // Seed Users
        if (!context.Users.Any())
        {
            SeedUsers(context);
        }

        // Seed Sample Datasets (after users)
        if (!context.Datasets.Any())
        {
            SeedSampleDatasets(context);
        }

        context.SaveChanges();
    }

    private static void SeedProvinces(EVDataMarketplaceDbContext context)
    {
        var provinces = new List<Province>
        {
            new Province { Name = "Hà Nội", Code = "01" },
            new Province { Name = "Hồ Chí Minh", Code = "79" },
            new Province { Name = "Đà Nẵng", Code = "48" },
            new Province { Name = "Hải Phòng", Code = "31" },
            new Province { Name = "Cần Thơ", Code = "92" },
            new Province { Name = "An Giang", Code = "89" },
            new Province { Name = "Bà Rịa - Vũng Tàu", Code = "77" },
            new Province { Name = "Bắc Giang", Code = "24" },
            new Province { Name = "Bắc Kạn", Code = "06" },
            new Province { Name = "Bạc Liêu", Code = "95" },
            new Province { Name = "Bắc Ninh", Code = "27" },
            new Province { Name = "Bến Tre", Code = "83" },
            new Province { Name = "Bình Định", Code = "52" },
            new Province { Name = "Bình Dương", Code = "74" },
            new Province { Name = "Bình Phước", Code = "70" },
            new Province { Name = "Bình Thuận", Code = "60" },
            new Province { Name = "Cà Mau", Code = "96" },
            new Province { Name = "Cao Bằng", Code = "04" },
            new Province { Name = "Đắk Lắk", Code = "66" },
            new Province { Name = "Đắk Nông", Code = "67" },
            new Province { Name = "Điện Biên", Code = "11" },
            new Province { Name = "Đồng Nai", Code = "75" },
            new Province { Name = "Đồng Tháp", Code = "87" },
            new Province { Name = "Gia Lai", Code = "64" },
            new Province { Name = "Hà Giang", Code = "02" },
            new Province { Name = "Hà Nam", Code = "35" },
            new Province { Name = "Hà Tĩnh", Code = "42" },
            new Province { Name = "Hải Dương", Code = "30" },
            new Province { Name = "Hậu Giang", Code = "93" },
            new Province { Name = "Hòa Bình", Code = "17" },
            new Province { Name = "Hưng Yên", Code = "33" },
            new Province { Name = "Khánh Hòa", Code = "56" },
            new Province { Name = "Kiên Giang", Code = "91" },
            new Province { Name = "Kon Tum", Code = "62" },
            new Province { Name = "Lai Châu", Code = "12" },
            new Province { Name = "Lâm Đồng", Code = "68" },
            new Province { Name = "Lạng Sơn", Code = "20" },
            new Province { Name = "Lào Cai", Code = "10" },
            new Province { Name = "Long An", Code = "80" },
            new Province { Name = "Nam Định", Code = "36" },
            new Province { Name = "Nghệ An", Code = "40" },
            new Province { Name = "Ninh Bình", Code = "37" },
            new Province { Name = "Ninh Thuận", Code = "58" },
            new Province { Name = "Phú Thọ", Code = "25" },
            new Province { Name = "Phú Yên", Code = "54" },
            new Province { Name = "Quảng Bình", Code = "44" },
            new Province { Name = "Quảng Nam", Code = "49" },
            new Province { Name = "Quảng Ngãi", Code = "51" },
            new Province { Name = "Quảng Ninh", Code = "22" },
            new Province { Name = "Quảng Trị", Code = "45" },
            new Province { Name = "Sóc Trăng", Code = "94" },
            new Province { Name = "Sơn La", Code = "14" },
            new Province { Name = "Tây Ninh", Code = "72" },
            new Province { Name = "Thái Bình", Code = "34" },
            new Province { Name = "Thái Nguyên", Code = "19" },
            new Province { Name = "Thanh Hóa", Code = "38" },
            new Province { Name = "Thừa Thiên Huế", Code = "46" },
            new Province { Name = "Tiền Giang", Code = "82" },
            new Province { Name = "Trà Vinh", Code = "84" },
            new Province { Name = "Tuyên Quang", Code = "08" },
            new Province { Name = "Vĩnh Long", Code = "86" },
            new Province { Name = "Vĩnh Phúc", Code = "26" },
            new Province { Name = "Yên Bái", Code = "15" }
        };

        context.Provinces.AddRange(provinces);
        context.SaveChanges();
    }

    private static void SeedDistricts(EVDataMarketplaceDbContext context)
    {
        // Get province IDs
        var hanoiId = context.Provinces.First(p => p.Name == "Hà Nội").ProvinceId;
        var hcmcId = context.Provinces.First(p => p.Name == "Hồ Chí Minh").ProvinceId;
        var danangId = context.Provinces.First(p => p.Name == "Đà Nẵng").ProvinceId;

        var districts = new List<District>
        {
            // Hà Nội districts
            new District { ProvinceId = hanoiId, Name = "Ba Đình", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Hoàn Kiếm", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Tây Hồ", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Long Biên", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Cầu Giấy", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Đống Đa", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Hai Bà Trưng", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Hoàng Mai", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Thanh Xuân", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Sóc Sơn", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Đông Anh", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Gia Lâm", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Nam Từ Liêm", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Thanh Trì", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Bắc Từ Liêm", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Mê Linh", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Hà Đông", Type = "Quận" },
            new District { ProvinceId = hanoiId, Name = "Sơn Tây", Type = "Thị xã" },
            new District { ProvinceId = hanoiId, Name = "Ba Vì", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Phúc Thọ", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Đan Phượng", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Hoài Đức", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Quốc Oai", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Thạch Thất", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Chương Mỹ", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Thanh Oai", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Thường Tín", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Phú Xuyên", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Ứng Hòa", Type = "Huyện" },
            new District { ProvinceId = hanoiId, Name = "Mỹ Đức", Type = "Huyện" },

            // TP HCM districts
            new District { ProvinceId = hcmcId, Name = "Quận 1", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 2", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 3", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 4", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 5", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 6", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 7", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 8", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 9", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 10", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 11", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Quận 12", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Thủ Đức", Type = "Thành phố" },
            new District { ProvinceId = hcmcId, Name = "Gò Vấp", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Bình Thạnh", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Tân Bình", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Tân Phú", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Phú Nhuận", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Bình Tân", Type = "Quận" },
            new District { ProvinceId = hcmcId, Name = "Củ Chi", Type = "Huyện" },
            new District { ProvinceId = hcmcId, Name = "Hóc Môn", Type = "Huyện" },
            new District { ProvinceId = hcmcId, Name = "Bình Chánh", Type = "Huyện" },
            new District { ProvinceId = hcmcId, Name = "Nhà Bè", Type = "Huyện" },
            new District { ProvinceId = hcmcId, Name = "Cần Giờ", Type = "Huyện" },

            // Đà Nẵng districts
            new District { ProvinceId = danangId, Name = "Liên Chiểu", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Thanh Khê", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Hải Châu", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Sơn Trà", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Ngũ Hành Sơn", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Cẩm Lệ", Type = "Quận" },
            new District { ProvinceId = danangId, Name = "Hòa Vang", Type = "Huyện" },
            new District { ProvinceId = danangId, Name = "Hoàng Sa", Type = "Huyện" }
        };

        context.Districts.AddRange(districts);
        context.SaveChanges();
    }

    private static void SeedSystemPricing(EVDataMarketplaceDbContext context)
    {
        var pricings = new List<SystemPricing>
        {
            new SystemPricing
            {
                PackageType = "DataPackage",
                Description = "Giá mua dữ liệu theo dòng - Data Package",
                PricePerRow = 10.0M, // 10 VNĐ/dòng
                ProviderCommissionPercent = 70.0M,
                AdminCommissionPercent = 30.0M,
                IsActive = true
            },
            new SystemPricing
            {
                PackageType = "SubscriptionPackage",
                Description = "Gói subscription xem dashboard analytics",
                PricePerRow = 0, // Not used for subscription
                SubscriptionMonthlyBase = 500000.0M, // 500,000 VNĐ/tháng
                ProviderCommissionPercent = 60.0M,
                AdminCommissionPercent = 40.0M,
                IsActive = true
            },
            new SystemPricing
            {
                PackageType = "APIPackage",
                Description = "Gói API access với giới hạn số lượng calls",
                PricePerRow = 0,
                ApiPricePerCall = 100.0M, // 100 VNĐ/call
                ProviderCommissionPercent = 65.0M,
                AdminCommissionPercent = 35.0M,
                IsActive = true
            }
        };

        context.SystemPricings.AddRange(pricings);
        context.SaveChanges();
    }

    private static void SeedUsers(EVDataMarketplaceDbContext context)
    {
        var users = new List<User>
        {
            new User
            {
                FullName = "Admin User",
                Email = "admin@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "Admin",
                Status = "Active"
            },
            new User
            {
                FullName = "Moderator User",
                Email = "moderator@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "Moderator",
                Status = "Active"
            },
            // Provider 1: VinFast
            new User
            {
                FullName = "VinFast Provider",
                Email = "provider@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
            // Provider 2: EVN
            new User
            {
                FullName = "EVN Charging Network",
                Email = "evn@provider.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
            // Provider 3: Petrolimex
            new User
            {
                FullName = "Petrolimex EV Stations",
                Email = "petrolimex@provider.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
            // Provider 4: GreenEV
            new User
            {
                FullName = "GreenEV Solutions",
                Email = "greenev@provider.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
            // Provider 5: FastCharge
            new User
            {
                FullName = "FastCharge Vietnam",
                Email = "fastcharge@provider.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
            // Consumer
            new User
            {
                FullName = "Consumer User",
                Email = "consumer@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataConsumer",
                Status = "Active"
            }
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        // Get provinces
        var hanoiProvince = context.Provinces.First(p => p.Name == "Hà Nội");
        var hcmcProvince = context.Provinces.First(p => p.Name == "Hồ Chí Minh");
        var danangProvince = context.Provinces.First(p => p.Name == "Đà Nẵng");
        var haiphongProvince = context.Provinces.First(p => p.Name == "Hải Phòng");
        var canthoProvince = context.Provinces.First(p => p.Name == "Cần Thơ");

        // Create DataProvider profiles
        var providers = new List<DataProvider>
        {
            new DataProvider
            {
                UserId = context.Users.First(u => u.Email == "provider@test.com").UserId,
                CompanyName = "VinFast Charging Network",
                CompanyWebsite = "https://vinfastauto.com",
                ContactEmail = "provider@test.com",
                ContactPhone = "+84123456789",
                Address = "Vinhomes Ocean Park, Gia Lâm, Hà Nội",
                ProvinceId = hanoiProvince.ProvinceId
            },
            new DataProvider
            {
                UserId = context.Users.First(u => u.Email == "evn@provider.com").UserId,
                CompanyName = "EVN Charging Solutions",
                CompanyWebsite = "https://evn.com.vn",
                ContactEmail = "evn@provider.com",
                ContactPhone = "+84123456790",
                Address = "18 Trần Nguyên Hãn, Hoàn Kiếm, Hà Nội",
                ProvinceId = hanoiProvince.ProvinceId
            },
            new DataProvider
            {
                UserId = context.Users.First(u => u.Email == "petrolimex@provider.com").UserId,
                CompanyName = "Petrolimex EV Charging",
                CompanyWebsite = "https://petrolimex.com.vn",
                ContactEmail = "petrolimex@provider.com",
                ContactPhone = "+84123456791",
                Address = "65 Trần Phú, Quận 5, TP.HCM",
                ProvinceId = hcmcProvince.ProvinceId
            },
            new DataProvider
            {
                UserId = context.Users.First(u => u.Email == "greenev@provider.com").UserId,
                CompanyName = "GreenEV Solutions",
                CompanyWebsite = "https://greenev.vn",
                ContactEmail = "greenev@provider.com",
                ContactPhone = "+84123456792",
                Address = "120 Nguyễn Văn Cừ, Hải Châu, Đà Nẵng",
                ProvinceId = danangProvince.ProvinceId
            },
            new DataProvider
            {
                UserId = context.Users.First(u => u.Email == "fastcharge@provider.com").UserId,
                CompanyName = "FastCharge Vietnam",
                CompanyWebsite = "https://fastcharge.vn",
                ContactEmail = "fastcharge@provider.com",
                ContactPhone = "+84123456793",
                Address = "88 Đinh Tiên Hoàng, Lê Chân, Hải Phòng",
                ProvinceId = haiphongProvince.ProvinceId
            }
        };

        context.DataProviders.AddRange(providers);

        // Create DataConsumer profile
        var consumerUser = context.Users.First(u => u.Email == "consumer@test.com");
        var consumer = new DataConsumer
        {
            UserId = consumerUser.UserId,
            OrganizationName = "EV Research Institute",
            ContactPerson = "Consumer User",
            ContactNumber = "+84987654321",
            BillingEmail = "billing@evresearch.com"
        };
        context.DataConsumers.Add(consumer);

        context.SaveChanges();
    }

    private static void SeedSampleDatasets(EVDataMarketplaceDbContext context)
    {
        var providers = context.DataProviders.ToList();
        if (!providers.Any()) return;

        // Get province IDs
        var hanoiId = context.Provinces.First(p => p.Name == "Hà Nội").ProvinceId;
        var hcmcId = context.Provinces.First(p => p.Name == "Hồ Chí Minh").ProvinceId;
        var danangId = context.Provinces.First(p => p.Name == "Đà Nẵng").ProvinceId;
        var haiphongId = context.Provinces.First(p => p.Name == "Hải Phòng").ProvinceId;
        var canthoId = context.Provinces.First(p => p.Name == "Cần Thơ").ProvinceId;

        var datasets = new List<Dataset>();

        // Provider 1: VinFast - Focus on Hanoi, HCMC, Danang
        var vinfastProvider = providers[0];
        datasets.AddRange(new[]
        {
            new Dataset
            {
                ProviderId = vinfastProvider.ProviderId,
                Name = "Hà Nội EV Charging Data - Q1 2025",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở Hà Nội trong quý 1 năm 2025. Bao gồm thông tin về năng lượng tiêu thụ, thời gian sạc, và chi phí.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-30),
                RowCount = 0
            },
            new Dataset
            {
                ProviderId = vinfastProvider.ProviderId,
                Name = "TP.HCM EV Charging Data - Q1 2025",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở TP.HCM trong quý 1 năm 2025.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-28),
                RowCount = 0
            },
            new Dataset
            {
                ProviderId = vinfastProvider.ProviderId,
                Name = "Đà Nẵng EV Charging Data - Q1 2025",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở Đà Nẵng trong quý 1 năm 2025.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-25),
                RowCount = 0
            }
        });

        // Provider 2: EVN - Focus on Hanoi, Haiphong
        if (providers.Count > 1)
        {
            var evnProvider = providers[1];
            datasets.AddRange(new[]
            {
                new Dataset
                {
                    ProviderId = evnProvider.ProviderId,
                    Name = "Hà Nội Fast Charging Stations - 2025",
                    Description = "Dữ liệu sạc nhanh của EVN tại Hà Nội năm 2025.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-22),
                    RowCount = 0
                },
                new Dataset
                {
                    ProviderId = evnProvider.ProviderId,
                    Name = "Hải Phòng Charging Network - 2025",
                    Description = "Mạng lưới trạm sạc EVN tại Hải Phòng.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-20),
                    RowCount = 0
                }
            });
        }

        // Provider 3: Petrolimex - Focus on HCMC, Cantho
        if (providers.Count > 2)
        {
            var petrolimexProvider = providers[2];
            datasets.AddRange(new[]
            {
                new Dataset
                {
                    ProviderId = petrolimexProvider.ProviderId,
                    Name = "TP.HCM Petrol Station EV Charging - Q1 2025",
                    Description = "Dữ liệu sạc xe điện tại các cây xăng Petrolimex ở TP.HCM.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-18),
                    RowCount = 0
                },
                new Dataset
                {
                    ProviderId = petrolimexProvider.ProviderId,
                    Name = "Cần Thơ Charging Stations - 2025",
                    Description = "Trạm sạc Petrolimex tại Cần Thơ và vùng lân cận.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-15),
                    RowCount = 0
                }
            });
        }

        // Provider 4: GreenEV - Focus on Danang
        if (providers.Count > 3)
        {
            var greenevProvider = providers[3];
            datasets.AddRange(new[]
            {
                new Dataset
                {
                    ProviderId = greenevProvider.ProviderId,
                    Name = "Đà Nẵng Eco-Friendly Charging - 2025",
                    Description = "Hệ thống trạm sạc thân thiện môi trường tại Đà Nẵng.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-12),
                    RowCount = 0
                },
                new Dataset
                {
                    ProviderId = greenevProvider.ProviderId,
                    Name = "Hà Nội Green Charging Network - 2025",
                    Description = "Mạng lưới sạc xanh tại Hà Nội.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-10),
                    RowCount = 0
                }
            });
        }

        // Provider 5: FastCharge - Focus on Haiphong, HCMC
        if (providers.Count > 4)
        {
            var fastchargeProvider = providers[4];
            datasets.AddRange(new[]
            {
                new Dataset
                {
                    ProviderId = fastchargeProvider.ProviderId,
                    Name = "Hải Phòng Super Fast Charging - 2025",
                    Description = "Trạm sạc siêu nhanh tại Hải Phòng.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-8),
                    RowCount = 0
                },
                new Dataset
                {
                    ProviderId = fastchargeProvider.ProviderId,
                    Name = "TP.HCM Express Charging Hubs - 2025",
                    Description = "Các điểm sạc nhanh tại TP.HCM.",
                    Category = "EV Charging",
                    DataFormat = "CSV",
                    ModerationStatus = "Approved",
                    Status = "Active",
                    Visibility = "Public",
                    UploadDate = DateTime.Now.AddDays(-5),
                    RowCount = 0
                }
            });
        }

        context.Datasets.AddRange(datasets);
        context.SaveChanges();

        // Get district IDs
        var hanoiDistricts = context.Districts.Where(d => d.ProvinceId == hanoiId).Take(5).Select(d => d.DistrictId).ToArray();
        var hcmcDistricts = context.Districts.Where(d => d.ProvinceId == hcmcId).Take(5).Select(d => d.DistrictId).ToArray();
        var danangDistricts = context.Districts.Where(d => d.ProvinceId == danangId).Take(4).Select(d => d.DistrictId).ToArray();
        var haiphongDistricts = new[] { haiphongId }; // No districts for Hai Phong, use province only
        var canthoDistricts = new[] { canthoId }; // No districts for Can Tho, use province only

        // Seed records for each dataset with varying amounts
        var datasetList = datasets.ToList();
        int datasetIndex = 0;

        // VinFast datasets (3)
        if (datasetList.Count > datasetIndex)
        {
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hanoiId, hanoiDistricts, 120);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hcmcId, hcmcDistricts, 150);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, danangId, danangDistricts, 80);
        }

        // EVN datasets (2)
        if (datasetList.Count > datasetIndex)
        {
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hanoiId, hanoiDistricts, 100);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, haiphongId, haiphongDistricts, 60);
        }

        // Petrolimex datasets (2)
        if (datasetList.Count > datasetIndex)
        {
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hcmcId, hcmcDistricts, 110);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, canthoId, canthoDistricts, 50);
        }

        // GreenEV datasets (2)
        if (datasetList.Count > datasetIndex)
        {
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, danangId, danangDistricts, 70);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hanoiId, hanoiDistricts, 90);
        }

        // FastCharge datasets (2)
        if (datasetList.Count > datasetIndex)
        {
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, haiphongId, haiphongDistricts, 65);
            SeedDatasetRecords(context, datasetList[datasetIndex++].DatasetId, hcmcId, hcmcDistricts, 130);
        }

        // Update row counts
        foreach (var dataset in datasets)
        {
            dataset.RowCount = context.DatasetRecords.Count(r => r.DatasetId == dataset.DatasetId);
        }
        context.SaveChanges();
    }

    private static void SeedDatasetRecords(EVDataMarketplaceDbContext context, int datasetId, int provinceId, int[] districtIds, int recordsPerDistrict)
    {
        var random = new Random();
        var records = new List<DatasetRecord>();
        // Generate data for the last 90 days (recent data)
        var startDate = DateTime.Now.AddDays(-90);

        var stationNames = new[] { "VinFast Station A", "VinFast Station B", "VinFast Station C", "Public Charging Hub", "EV Plaza" };
        var vehicleTypes = new[] { "VF8", "VF9", "VFe34", "Other EV" };
        var operators = new[] { "VinFast", "EVN", "Petrolimex", "Shell" };

        foreach (var districtId in districtIds)
        {
            for (int i = 0; i < recordsPerDistrict; i++)
            {
                var chargingDate = startDate.AddDays(random.Next(0, 90)).AddHours(random.Next(0, 24));
                var energyKwh = Math.Round((decimal)(20 + random.NextDouble() * 60), 2); // 20-80 kWh
                var voltage = 220 + random.Next(0, 20); // 220-240V
                var current = Math.Round((decimal)(10 + random.NextDouble() * 30), 1); // 10-40A
                var powerKw = Math.Round(voltage * current / 1000, 2);
                var duration = random.Next(30, 180); // 30-180 minutes
                var cost = Math.Round(energyKwh * (3000 + random.Next(-500, 500)), 0); // ~3000 VND/kWh
                var socStart = random.Next(10, 40); // 10-40%
                var socEnd = random.Next(70, 100); // 70-100%
                var batteryCapacity = random.Next(60, 100); // 60-100 kWh

                var stationId = $"STATION_{provinceId:00}_{districtId:00}_{(i % 5) + 1:00}";
                var stationName = stationNames[i % stationNames.Length];
                var address = $"Địa chỉ trạm {i + 1}, Quận/Huyện {districtId}";

                records.Add(new DatasetRecord
                {
                    DatasetId = datasetId,
                    StationId = stationId,
                    StationName = stationName,
                    StationAddress = address,
                    StationOperator = operators[random.Next(operators.Length)],
                    ProvinceId = provinceId,
                    DistrictId = districtId,
                    ChargingTimestamp = chargingDate,
                    EnergyKwh = energyKwh,
                    Voltage = voltage,
                    Current = current,
                    PowerKw = powerKw,
                    DurationMinutes = duration,
                    ChargingCost = cost,
                    VehicleType = vehicleTypes[random.Next(vehicleTypes.Length)],
                    BatteryCapacityKwh = batteryCapacity,
                    SocStart = socStart,
                    SocEnd = socEnd
                });
            }
        }

        context.DatasetRecords.AddRange(records);
        context.SaveChanges();
    }
}
