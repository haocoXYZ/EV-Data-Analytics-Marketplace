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
            new User
            {
                FullName = "VinFast Provider",
                Email = "provider@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "DataProvider",
                Status = "Active"
            },
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

        // Create DataProvider profile
        var providerUser = context.Users.First(u => u.Email == "provider@test.com");
        var hanoiProvince = context.Provinces.First(p => p.Name == "Hà Nội");
        var provider = new DataProvider
        {
            UserId = providerUser.UserId,
            CompanyName = "VinFast Charging Network",
            CompanyWebsite = "https://vinfastauto.com",
            ContactEmail = "provider@test.com",
            ContactPhone = "+84123456789",
            Address = "Vinhomes Ocean Park, Gia Lâm, Hà Nội",
            ProvinceId = hanoiProvince.ProvinceId // Hà Nội
        };
        context.DataProviders.Add(provider);

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
        var provider = context.DataProviders.FirstOrDefault();
        if (provider == null) return;

        // Create 3 sample datasets
        var datasets = new List<Dataset>
        {
            new Dataset
            {
                ProviderId = provider.ProviderId,
                Name = "Hà Nội EV Charging Data - Q1 2024",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở Hà Nội trong quý 1 năm 2024. Bao gồm thông tin về năng lượng tiêu thụ, thời gian sạc, và chi phí.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-30),
                RowCount = 0 // Will be updated after adding records
            },
            new Dataset
            {
                ProviderId = provider.ProviderId,
                Name = "TP.HCM EV Charging Data - Q1 2024",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở TP.HCM trong quý 1 năm 2024.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-25),
                RowCount = 0
            },
            new Dataset
            {
                ProviderId = provider.ProviderId,
                Name = "Đà Nẵng EV Charging Data - Q1 2024",
                Description = "Dữ liệu sạc xe điện tại các trạm VinFast ở Đà Nẵng trong quý 1 năm 2024.",
                Category = "EV Charging",
                DataFormat = "CSV",
                ModerationStatus = "Approved",
                Status = "Active",
                Visibility = "Public",
                UploadDate = DateTime.Now.AddDays(-20),
                RowCount = 0
            }
        };

        context.Datasets.AddRange(datasets);
        context.SaveChanges();

        // Get province IDs
        var hanoiId = context.Provinces.First(p => p.Name == "Hà Nội").ProvinceId;
        var hcmcId = context.Provinces.First(p => p.Name == "Hồ Chí Minh").ProvinceId;
        var danangId = context.Provinces.First(p => p.Name == "Đà Nẵng").ProvinceId;

        // Get district IDs
        var hanoiDistricts = context.Districts.Where(d => d.ProvinceId == hanoiId).Take(4).Select(d => d.DistrictId).ToArray();
        var hcmcDistricts = context.Districts.Where(d => d.ProvinceId == hcmcId).Take(4).Select(d => d.DistrictId).ToArray();
        var danangDistricts = context.Districts.Where(d => d.ProvinceId == danangId).Take(3).Select(d => d.DistrictId).ToArray();

        // Add sample records for each dataset
        SeedDatasetRecords(context, datasets[0].DatasetId, hanoiId, hanoiDistricts, 100); // Hanoi - 4 districts
        SeedDatasetRecords(context, datasets[1].DatasetId, hcmcId, hcmcDistricts, 80); // HCMC - 4 districts
        SeedDatasetRecords(context, datasets[2].DatasetId, danangId, danangDistricts, 60); // Danang - 3 districts

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
