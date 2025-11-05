using Microsoft.Data.SqlClient;
using System;

class CheckDbData
{
    static void Main(string[] args)
    {
        string connectionString = "Server=14.103.183.82;Database=db_easycode_cm;User Id=db_easycode_cm;Password=hFDetyBSsxZ5Ndjm;TrustServerCertificate=True;Encrypt=True;";
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                Console.WriteLine("✓ Connected to database successfully!\n");
                
                // 1. Check Provinces
                Console.WriteLine("=== PROVINCES ===");
                using (SqlCommand cmd = new SqlCommand("SELECT province_id, name FROM Province WHERE name = N'Hà Nội'", conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Console.WriteLine($"Province ID: {reader["province_id"]}, Name: {reader["name"]}");
                    }
                }
                
                // 2. Check Districts for Hanoi
                Console.WriteLine("\n=== DISTRICTS (Hà Nội) ===");
                using (SqlCommand cmd = new SqlCommand(
                    @"SELECT d.district_id, d.name 
                      FROM District d
                      INNER JOIN Province p ON d.province_id = p.province_id
                      WHERE p.name = N'Hà Nội'
                      ORDER BY d.district_id", conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Console.WriteLine($"District ID: {reader["district_id"]}, Name: {reader["name"]}");
                    }
                }
                
                // 3. Check Subscriptions
                Console.WriteLine("\n=== SUBSCRIPTIONS ===");
                using (SqlCommand cmd = new SqlCommand(
                    @"SELECT s.subscription_id, s.province_id, s.district_id, s.status,
                             p.name AS province_name, d.name AS district_name
                      FROM SubscriptionPackagePurchase s
                      LEFT JOIN Province p ON s.province_id = p.province_id
                      LEFT JOIN District d ON s.district_id = d.district_id", conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Console.WriteLine($"Subscription ID: {reader["subscription_id"]}, Province: {reader["province_name"]}, District: {reader["district_name"]}, Status: {reader["status"]}");
                    }
                }
                
                // 4. Check DatasetRecords total count
                Console.WriteLine("\n=== DATASET RECORDS COUNT ===");
                using (SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM DatasetRecords", conn))
                {
                    int count = (int)cmd.ExecuteScalar();
                    Console.WriteLine($"Total DatasetRecords: {count}");
                }
                
                // 5. Check DatasetRecords by District
                Console.WriteLine("\n=== DATASET RECORDS BY DISTRICT (Hà Nội) ===");
                using (SqlCommand cmd = new SqlCommand(
                    @"SELECT d.district_id, d.name AS district_name, COUNT(dr.record_id) AS record_count
                      FROM District d
                      LEFT JOIN DatasetRecords dr ON d.district_id = dr.district_id
                      WHERE d.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
                      GROUP BY d.district_id, d.name
                      ORDER BY d.district_id", conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Console.WriteLine($"District ID: {reader["district_id"]}, Name: {reader["district_name"]}, Records: {reader["record_count"]}");
                    }
                }
                
                // 6. Check sample records for Ba Dinh
                Console.WriteLine("\n=== SAMPLE RECORDS (Ba Đình) ===");
                using (SqlCommand cmd = new SqlCommand(
                    @"SELECT TOP 3
                        dr.record_id, 
                        dr.station_name, 
                        dr.charging_timestamp, 
                        dr.energy_kwh,
                        dr.province_id,
                        dr.district_id,
                        d.name AS district_name
                      FROM DatasetRecords dr
                      LEFT JOIN District d ON dr.district_id = d.district_id
                      WHERE d.name = N'Ba Đình'
                      ORDER BY dr.charging_timestamp DESC", conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (!reader.HasRows)
                    {
                        Console.WriteLine("⚠ NO RECORDS FOUND for Ba Đình district!");
                    }
                    while (reader.Read())
                    {
                        Console.WriteLine($"Record ID: {reader["record_id"]}, Station: {reader["station_name"]}, Energy: {reader["energy_kwh"]} kWh, Time: {reader["charging_timestamp"]}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }
}

