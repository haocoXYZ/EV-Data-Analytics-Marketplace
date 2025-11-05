#!/usr/bin/env dotnet-script
#r "nuget: Microsoft.Data.SqlClient, 5.1.0"

using Microsoft.Data.SqlClient;
using System;
using System.Data;

string connectionString = "Server=14.103.183.82;Database=db_easycode_cm;User Id=db_easycode_cm;Password=hFDetyBSsxZ5Ndjm;TrustServerCertificate=True;Encrypt=True;Connection Timeout=30;";

Console.WriteLine("=== KIỂM TRA DATABASE ===\n");

try
{
    using (SqlConnection conn = new SqlConnection(connectionString))
    {
        conn.Open();
        Console.WriteLine("✓ Kết nối database thành công!\n");

        // 1. Kiểm tra Province Hà Nội
        Console.WriteLine("=== 1. PROVINCE (Hà Nội) ===");
        using (SqlCommand cmd = new SqlCommand("SELECT province_id, name FROM Province WHERE name = N'Hà Nội'", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            if (reader.Read())
            {
                Console.WriteLine($"Province ID: {reader["province_id"]}, Name: {reader["name"]}\n");
            }
            else
            {
                Console.WriteLine("⚠ KHÔNG TÌM THẤY Province 'Hà Nội'!\n");
            }
        }

        // 2. Kiểm tra Districts của Hà Nội
        Console.WriteLine("=== 2. DISTRICTS (Hà Nội) ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT d.district_id, d.name, d.type
            FROM District d
            INNER JOIN Province p ON d.province_id = p.province_id
            WHERE p.name = N'Hà Nội'
            ORDER BY d.district_id", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            int count = 0;
            while (reader.Read())
            {
                Console.WriteLine($"  • District ID: {reader["district_id"]}, Name: {reader["name"]}, Type: {reader["type"]}");
                count++;
            }
            Console.WriteLine($"Total: {count} districts\n");
        }

        // 3. Kiểm tra Subscriptions
        Console.WriteLine("=== 3. SUBSCRIPTIONS ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT s.subscription_id, s.consumer_id, s.province_id, s.district_id, s.status,
                   p.name AS province_name, d.name AS district_name, s.start_date, s.end_date
            FROM SubscriptionPackagePurchase s
            LEFT JOIN Province p ON s.province_id = p.province_id
            LEFT JOIN District d ON s.district_id = d.district_id
            ORDER BY s.subscription_id", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            int count = 0;
            while (reader.Read())
            {
                Console.WriteLine($"  • Sub ID: {reader["subscription_id"]}, Consumer: {reader["consumer_id"]}, " +
                                $"Province: {reader["province_name"]}, District: {reader["district_name"] ?? "NULL"}, " +
                                $"Status: {reader["status"]}, Start: {reader["start_date"]}, End: {reader["end_date"]}");
                count++;
            }
            Console.WriteLine($"Total: {count} subscriptions\n");
        }

        // 4. Kiểm tra tổng số DatasetRecords
        Console.WriteLine("=== 4. DATASET RECORDS (Total) ===");
        using (SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM DatasetRecords", conn))
        {
            int totalCount = (int)cmd.ExecuteScalar();
            Console.WriteLine($"Total DatasetRecords: {totalCount:N0}\n");
        }

        // 5. Kiểm tra DatasetRecords cho Hà Nội (province_id = 1)
        Console.WriteLine("=== 5. DATASET RECORDS (Hà Nội) ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT province_id, COUNT(*) as record_count
            FROM DatasetRecords
            WHERE province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
            GROUP BY province_id", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            if (reader.Read())
            {
                Console.WriteLine($"Province ID: {reader["province_id"]}, Records: {reader["record_count"]:N0}\n");
            }
            else
            {
                Console.WriteLine("⚠ KHÔNG CÓ RECORDS nào cho Hà Nội!\n");
            }
        }

        // 6. Kiểm tra DatasetRecords theo từng District của Hà Nội
        Console.WriteLine("=== 6. DATASET RECORDS BY DISTRICT (Hà Nội) ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT d.district_id, d.name AS district_name, COUNT(dr.RecordId) AS record_count
            FROM District d
            LEFT JOIN DatasetRecords dr ON d.district_id = dr.district_id
            WHERE d.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
            GROUP BY d.district_id, d.name
            ORDER BY COUNT(dr.RecordId) DESC", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            bool hasData = false;
            while (reader.Read())
            {
                var recordCount = reader["record_count"];
                if (Convert.ToInt32(recordCount) > 0)
                {
                    Console.WriteLine($"  • District ID: {reader["district_id"]}, Name: {reader["district_name"]}, Records: {recordCount:N0}");
                    hasData = true;
                }
            }
            if (!hasData)
            {
                Console.WriteLine("  ⚠ KHÔNG CÓ RECORDS nào cho bất kỳ district nào của Hà Nội!");
            }
            Console.WriteLine();
        }

        // 7. Kiểm tra DatasetRecords với ModerationStatus = 'Approved'
        Console.WriteLine("=== 7. APPROVED DATASET RECORDS (Hà Nội) ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT COUNT(dr.RecordId) as count
            FROM DatasetRecords dr
            INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
            WHERE dr.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
              AND ds.moderation_status = 'Approved'", conn))
        {
            var count = cmd.ExecuteScalar();
            Console.WriteLine($"Approved records for Hà Nội: {count:N0}\n");
        }

        // 8. Kiểm tra Datasets và moderation_status
        Console.WriteLine("=== 8. DATASETS & MODERATION STATUS ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT dataset_id, dataset_name, moderation_status, COUNT(*) OVER() as total_datasets
            FROM Dataset
            ORDER BY dataset_id", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            int count = 0;
            while (reader.Read())
            {
                Console.WriteLine($"  • Dataset ID: {reader["dataset_id"]}, Name: {reader["dataset_name"]}, Status: {reader["moderation_status"]}");
                count++;
            }
            Console.WriteLine($"Total: {count} datasets\n");
        }

        // 9. Sample records từ Ba Đình
        Console.WriteLine("=== 9. SAMPLE RECORDS (Ba Đình) ===");
        using (SqlCommand cmd = new SqlCommand(@"
            SELECT TOP 3
                dr.RecordId, 
                dr.station_name, 
                dr.charging_timestamp, 
                dr.energy_kwh,
                dr.province_id,
                dr.district_id,
                d.name AS district_name,
                ds.moderation_status
            FROM DatasetRecords dr
            LEFT JOIN District d ON dr.district_id = d.district_id
            LEFT JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
            WHERE d.name = N'Ba Đình'
            ORDER BY dr.charging_timestamp DESC", conn))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            if (!reader.HasRows)
            {
                Console.WriteLine("  ⚠ KHÔNG CÓ RECORDS nào cho Ba Đình!\n");
            }
            else
            {
                while (reader.Read())
                {
                    Console.WriteLine($"  • Record ID: {reader["RecordId"]}, Station: {reader["station_name"]}, " +
                                    $"Energy: {reader["energy_kwh"]} kWh, Time: {reader["charging_timestamp"]}, " +
                                    $"Status: {reader["moderation_status"]}");
                }
                Console.WriteLine();
            }
        }

        Console.WriteLine("=== HOÀN THÀNH ===");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ LỖI: {ex.Message}");
    Console.WriteLine($"\nStack Trace:\n{ex.StackTrace}");
    Environment.Exit(1);
}

