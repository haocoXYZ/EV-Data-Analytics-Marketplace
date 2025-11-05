using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;

namespace TestDbQuery
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== TESTING DATABASE CONNECTION AND QUERIES ===\n");

            var connectionString = "Server=14.103.183.82;Database=db_easycode_cm;User Id=db_easycode_cm;Password=hFDetyBSsxZ5Ndjm;TrustServerCertificate=True;Encrypt=True;";
            
            var optionsBuilder = new DbContextOptionsBuilder<EVDataMarketplaceDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            try
            {
                using (var context = new EVDataMarketplaceDbContext(optionsBuilder.Options))
                {
                    Console.WriteLine("✓ DbContext created successfully\n");

                    // 1. Check Provinces
                    Console.WriteLine("=== 1. PROVINCES ===");
                    var provinces = await context.Provinces.ToListAsync();
                    Console.WriteLine($"Total provinces: {provinces.Count}");
                    var hanoi = provinces.FirstOrDefault(p => p.Name == "Hà Nội");
                    if (hanoi != null)
                    {
                        Console.WriteLine($"Hà Nội found - ID: {hanoi.ProvinceId}, Code: {hanoi.Code}");
                    }
                    else
                    {
                        Console.WriteLine("⚠ Hà Nội NOT FOUND!");
                    }
                    Console.WriteLine();

                    // 2. Check Districts for Hanoi
                    Console.WriteLine("=== 2. DISTRICTS (Hà Nội) ===");
                    if (hanoi != null)
                    {
                        var districts = await context.Districts
                            .Where(d => d.ProvinceId == hanoi.ProvinceId)
                            .OrderBy(d => d.DistrictId)
                            .ToListAsync();
                        
                        Console.WriteLine($"Total districts in Hà Nội: {districts.Count}");
                        foreach (var district in districts.Take(5))
                        {
                            Console.WriteLine($"  - ID: {district.DistrictId}, Name: {district.Name}");
                        }
                        if (districts.Count > 5)
                        {
                            Console.WriteLine($"  ... and {districts.Count - 5} more");
                        }
                    }
                    Console.WriteLine();

                    // 3. Check Subscriptions
                    Console.WriteLine("=== 3. SUBSCRIPTIONS ===");
                    var subscriptions = await context.SubscriptionPackagePurchases
                        .Include(s => s.Province)
                        .Include(s => s.District)
                        .ToListAsync();
                    
                    Console.WriteLine($"Total subscriptions: {subscriptions.Count}");
                    foreach (var sub in subscriptions)
                    {
                        Console.WriteLine($"  Sub ID: {sub.SubscriptionId}");
                        Console.WriteLine($"    Consumer ID: {sub.ConsumerId}");
                        Console.WriteLine($"    Province: {sub.Province?.Name ?? "NULL"} (ID: {sub.ProvinceId})");
                        Console.WriteLine($"    District: {sub.District?.Name ?? "NULL"} (ID: {sub.DistrictId})");
                        Console.WriteLine($"    Status: {sub.Status}");
                        Console.WriteLine($"    Period: {sub.StartDate:yyyy-MM-dd} to {sub.EndDate:yyyy-MM-dd}");
                        Console.WriteLine();
                    }

                    // 4. Check DatasetRecords - Total Count
                    Console.WriteLine("=== 4. DATASET RECORDS ===");
                    var totalRecords = await context.DatasetRecords.CountAsync();
                    Console.WriteLine($"Total DatasetRecords: {totalRecords}");
                    Console.WriteLine();

                    // 5. Check DatasetRecords for Hanoi
                    if (hanoi != null)
                    {
                        Console.WriteLine("=== 5. DATASET RECORDS (Hà Nội) ===");
                        var hanoiRecords = await context.DatasetRecords
                            .Where(r => r.ProvinceId == hanoi.ProvinceId)
                            .CountAsync();
                        Console.WriteLine($"Total records for Hà Nội: {hanoiRecords}");
                        Console.WriteLine();

                        // 6. Check DatasetRecords by District
                        Console.WriteLine("=== 6. DATASET RECORDS BY DISTRICT ===");
                        var recordsByDistrict = await context.DatasetRecords
                            .Where(r => r.ProvinceId == hanoi.ProvinceId)
                            .GroupBy(r => new { r.DistrictId, r.District!.Name })
                            .Select(g => new
                            {
                                DistrictId = g.Key.DistrictId,
                                DistrictName = g.Key.Name,
                                RecordCount = g.Count()
                            })
                            .OrderByDescending(x => x.RecordCount)
                            .ToListAsync();

                        foreach (var item in recordsByDistrict.Take(10))
                        {
                            Console.WriteLine($"  District ID: {item.DistrictId}, Name: {item.DistrictName ?? "NULL"}, Records: {item.RecordCount}");
                        }
                        Console.WriteLine();

                        // 7. Sample records for Ba Dinh
                        Console.WriteLine("=== 7. SAMPLE RECORDS (Ba Đình) ===");
                        var baDinh = await context.Districts
                            .FirstOrDefaultAsync(d => d.Name == "Ba Đình" && d.ProvinceId == hanoi.ProvinceId);
                        
                        if (baDinh != null)
                        {
                            Console.WriteLine($"Ba Đình district found - ID: {baDinh.DistrictId}");
                            
                            var baDinhRecords = await context.DatasetRecords
                                .Include(r => r.District)
                                .Where(r => r.DistrictId == baDinh.DistrictId)
                                .OrderByDescending(r => r.ChargingTimestamp)
                                .Take(3)
                                .ToListAsync();

                            Console.WriteLine($"Found {baDinhRecords.Count} sample records:");
                            foreach (var record in baDinhRecords)
                            {
                                Console.WriteLine($"  Record ID: {record.RecordId}");
                                Console.WriteLine($"    Station: {record.StationName}");
                                Console.WriteLine($"    Energy: {record.EnergyKwh} kWh");
                                Console.WriteLine($"    Timestamp: {record.ChargingTimestamp:yyyy-MM-dd HH:mm:ss}");
                                Console.WriteLine();
                            }
                            
                            if (baDinhRecords.Count == 0)
                            {
                                Console.WriteLine("  ⚠ NO RECORDS found for Ba Đình!");
                            }
                        }
                        else
                        {
                            Console.WriteLine("⚠ Ba Đình district NOT FOUND!");
                        }
                        Console.WriteLine();

                        // 8. Test subscription query logic
                        Console.WriteLine("=== 8. TEST SUBSCRIPTION QUERY (simulating API endpoint) ===");
                        var testSubscription = subscriptions.FirstOrDefault();
                        if (testSubscription != null)
                        {
                            Console.WriteLine($"Testing with subscription ID: {testSubscription.SubscriptionId}");
                            Console.WriteLine($"Province ID: {testSubscription.ProvinceId}, District ID: {testSubscription.DistrictId}");
                            
                            var query = context.DatasetRecords
                                .Include(r => r.Dataset)
                                .Where(r => r.ProvinceId == testSubscription.ProvinceId)
                                .Where(r => r.Dataset!.ModerationStatus == "Approved");

                            if (testSubscription.DistrictId.HasValue)
                            {
                                query = query.Where(r => r.DistrictId == testSubscription.DistrictId.Value);
                                Console.WriteLine($"  Filtering by District ID: {testSubscription.DistrictId.Value}");
                            }

                            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
                            query = query.Where(r => r.ChargingTimestamp >= thirtyDaysAgo);
                            Console.WriteLine($"  Filtering records since: {thirtyDaysAgo:yyyy-MM-dd}");

                            var queryResults = await query.ToListAsync();
                            Console.WriteLine($"  Query returned: {queryResults.Count} records");
                            
                            if (queryResults.Count > 0)
                            {
                                var totalEnergy = queryResults.Sum(r => r.EnergyKwh);
                                var uniqueStations = queryResults.Select(r => r.StationId).Distinct().Count();
                                Console.WriteLine($"  Total energy: {totalEnergy} kWh");
                                Console.WriteLine($"  Unique stations: {uniqueStations}");
                            }
                            else
                            {
                                Console.WriteLine("  ⚠ QUERY RETURNED NO RESULTS!");
                                
                                // Debug: Check without date filter
                                var queryNoDate = context.DatasetRecords
                                    .Include(r => r.Dataset)
                                    .Where(r => r.ProvinceId == testSubscription.ProvinceId);
                                
                                if (testSubscription.DistrictId.HasValue)
                                {
                                    queryNoDate = queryNoDate.Where(r => r.DistrictId == testSubscription.DistrictId.Value);
                                }
                                
                                var countNoDate = await queryNoDate.CountAsync();
                                Console.WriteLine($"  Debug: Without date filter: {countNoDate} records");
                                
                                // Check with only province filter
                                var countProvince = await context.DatasetRecords
                                    .Where(r => r.ProvinceId == testSubscription.ProvinceId)
                                    .CountAsync();
                                Console.WriteLine($"  Debug: Province only filter: {countProvince} records");
                            }
                        }
                    }

                    Console.WriteLine("\n=== TEST COMPLETED ===");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n❌ ERROR: {ex.Message}");
                Console.WriteLine($"\nStack Trace:\n{ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"\nInner Exception: {ex.InnerException.Message}");
                }
            }
        }
    }
}

