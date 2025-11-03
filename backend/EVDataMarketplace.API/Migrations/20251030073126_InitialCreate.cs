using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EVDataMarketplace.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PricingTier",
                columns: table => new
                {
                    tier_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tier_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    base_price_per_mb = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    api_price_per_call = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    subscription_price_per_region = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    provider_commission_percent = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    admin_commission_percent = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingTier", x => x.tier_id);
                });

            migrationBuilder.CreateTable(
                name: "Province",
                columns: table => new
                {
                    province_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Province", x => x.province_id);
                });

            migrationBuilder.CreateTable(
                name: "SystemPricing",
                columns: table => new
                {
                    pricing_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    package_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    price_per_row = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    subscription_monthly_base = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    api_price_per_call = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    provider_commission_percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    admin_commission_percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemPricing", x => x.pricing_id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "District",
                columns: table => new
                {
                    district_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    province_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_District", x => x.district_id);
                    table.ForeignKey(
                        name: "FK_District_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DataConsumer",
                columns: table => new
                {
                    consumer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    organization_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    contact_person = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    contact_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    billing_email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataConsumer", x => x.consumer_id);
                    table.ForeignKey(
                        name: "FK_DataConsumer_User_user_id",
                        column: x => x.user_id,
                        principalTable: "User",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DataProvider",
                columns: table => new
                {
                    provider_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    company_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    company_website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    contact_email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    contact_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    province_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataProvider", x => x.provider_id);
                    table.ForeignKey(
                        name: "FK_DataProvider_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id");
                    table.ForeignKey(
                        name: "FK_DataProvider_User_user_id",
                        column: x => x.user_id,
                        principalTable: "User",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APIPackagePurchase",
                columns: table => new
                {
                    api_purchase_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    consumer_id = table.Column<int>(type: "int", nullable: false),
                    province_id = table.Column<int>(type: "int", nullable: true),
                    district_id = table.Column<int>(type: "int", nullable: true),
                    api_calls_purchased = table.Column<int>(type: "int", nullable: false),
                    api_calls_used = table.Column<int>(type: "int", nullable: false),
                    price_per_call = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    total_paid = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APIPackagePurchase", x => x.api_purchase_id);
                    table.ForeignKey(
                        name: "FK_APIPackagePurchase_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APIPackagePurchase_District_district_id",
                        column: x => x.district_id,
                        principalTable: "District",
                        principalColumn: "district_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APIPackagePurchase_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DataPackagePurchase",
                columns: table => new
                {
                    purchase_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    consumer_id = table.Column<int>(type: "int", nullable: false),
                    province_id = table.Column<int>(type: "int", nullable: false),
                    district_id = table.Column<int>(type: "int", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    row_count = table.Column<int>(type: "int", nullable: false),
                    price_per_row = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    total_price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    download_count = table.Column<int>(type: "int", nullable: false),
                    max_download = table.Column<int>(type: "int", nullable: false),
                    last_download_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataPackagePurchase", x => x.purchase_id);
                    table.ForeignKey(
                        name: "FK_DataPackagePurchase_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DataPackagePurchase_District_district_id",
                        column: x => x.district_id,
                        principalTable: "District",
                        principalColumn: "district_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DataPackagePurchase_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    consumer_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    payment_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    payment_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    reference_id = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    transaction_ref = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    payos_order_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK_Payment_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPackagePurchase",
                columns: table => new
                {
                    subscription_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    consumer_id = table.Column<int>(type: "int", nullable: false),
                    province_id = table.Column<int>(type: "int", nullable: false),
                    district_id = table.Column<int>(type: "int", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    billing_cycle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    monthly_price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    total_paid = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    auto_renew = table.Column<bool>(type: "bit", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    dashboard_access_count = table.Column<int>(type: "int", nullable: false),
                    last_access_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPackagePurchase", x => x.subscription_id);
                    table.ForeignKey(
                        name: "FK_SubscriptionPackagePurchase_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubscriptionPackagePurchase_District_district_id",
                        column: x => x.district_id,
                        principalTable: "District",
                        principalColumn: "district_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubscriptionPackagePurchase_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Dataset",
                columns: table => new
                {
                    dataset_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    provider_id = table.Column<int>(type: "int", nullable: false),
                    port_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    category = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    data_format = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    row_count = table.Column<int>(type: "int", nullable: false),
                    upload_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    last_updated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    visibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    moderation_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PricingTierTierId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dataset", x => x.dataset_id);
                    table.ForeignKey(
                        name: "FK_Dataset_DataProvider_provider_id",
                        column: x => x.provider_id,
                        principalTable: "DataProvider",
                        principalColumn: "provider_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Dataset_PricingTier_PricingTierTierId",
                        column: x => x.PricingTierTierId,
                        principalTable: "PricingTier",
                        principalColumn: "tier_id");
                });

            migrationBuilder.CreateTable(
                name: "Payout",
                columns: table => new
                {
                    payout_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    provider_id = table.Column<int>(type: "int", nullable: true),
                    month_year = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    total_due = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    payout_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    payout_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    bank_account = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    transaction_ref = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payout", x => x.payout_id);
                    table.ForeignKey(
                        name: "FK_Payout_DataProvider_provider_id",
                        column: x => x.provider_id,
                        principalTable: "DataProvider",
                        principalColumn: "provider_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APIKey",
                columns: table => new
                {
                    key_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    api_purchase_id = table.Column<int>(type: "int", nullable: false),
                    consumer_id = table.Column<int>(type: "int", nullable: false),
                    key_value = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    key_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    last_used_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    revoked_reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    requests_today = table.Column<int>(type: "int", nullable: false),
                    last_request_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APIKey", x => x.key_id);
                    table.ForeignKey(
                        name: "FK_APIKey_APIPackagePurchase_api_purchase_id",
                        column: x => x.api_purchase_id,
                        principalTable: "APIPackagePurchase",
                        principalColumn: "api_purchase_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APIKey_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APIPackage",
                columns: table => new
                {
                    api_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    dataset_id = table.Column<int>(type: "int", nullable: true),
                    consumer_id = table.Column<int>(type: "int", nullable: true),
                    api_key = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    api_calls_purchased = table.Column<int>(type: "int", nullable: true),
                    api_calls_used = table.Column<int>(type: "int", nullable: false),
                    price_per_call = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    total_paid = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APIPackage", x => x.api_id);
                    table.ForeignKey(
                        name: "FK_APIPackage_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APIPackage_Dataset_dataset_id",
                        column: x => x.dataset_id,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DatasetModeration",
                columns: table => new
                {
                    moderation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    dataset_id = table.Column<int>(type: "int", nullable: true),
                    moderator_user_id = table.Column<int>(type: "int", nullable: true),
                    review_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    moderation_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    comments = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatasetModeration", x => x.moderation_id);
                    table.ForeignKey(
                        name: "FK_DatasetModeration_Dataset_dataset_id",
                        column: x => x.dataset_id,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DatasetModeration_User_moderator_user_id",
                        column: x => x.moderator_user_id,
                        principalTable: "User",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DatasetRecords",
                columns: table => new
                {
                    RecordId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DatasetId = table.Column<int>(type: "int", nullable: false),
                    province_id = table.Column<int>(type: "int", nullable: false),
                    district_id = table.Column<int>(type: "int", nullable: false),
                    station_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    station_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    station_address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    station_operator = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    charging_timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    energy_kwh = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    voltage = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    current = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    power_kw = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    duration_minutes = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    charging_cost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    vehicle_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    battery_capacity_kwh = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    soc_start = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    soc_end = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    data_source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatasetRecords", x => x.RecordId);
                    table.ForeignKey(
                        name: "FK_DatasetRecords_Dataset_DatasetId",
                        column: x => x.DatasetId,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DatasetRecords_District_district_id",
                        column: x => x.district_id,
                        principalTable: "District",
                        principalColumn: "district_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DatasetRecords_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OneTimePurchase",
                columns: table => new
                {
                    otp_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    dataset_id = table.Column<int>(type: "int", nullable: true),
                    consumer_id = table.Column<int>(type: "int", nullable: true),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    total_price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    license_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    download_count = table.Column<int>(type: "int", nullable: false),
                    max_download = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OneTimePurchase", x => x.otp_id);
                    table.ForeignKey(
                        name: "FK_OneTimePurchase_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OneTimePurchase_Dataset_dataset_id",
                        column: x => x.dataset_id,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RevenueShare",
                columns: table => new
                {
                    share_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    payment_id = table.Column<int>(type: "int", nullable: true),
                    provider_id = table.Column<int>(type: "int", nullable: true),
                    dataset_id = table.Column<int>(type: "int", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    provider_share = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    admin_share = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    calculated_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    payout_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RevenueShare", x => x.share_id);
                    table.ForeignKey(
                        name: "FK_RevenueShare_DataProvider_provider_id",
                        column: x => x.provider_id,
                        principalTable: "DataProvider",
                        principalColumn: "provider_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RevenueShare_Dataset_dataset_id",
                        column: x => x.dataset_id,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id");
                    table.ForeignKey(
                        name: "FK_RevenueShare_Payment_payment_id",
                        column: x => x.payment_id,
                        principalTable: "Payment",
                        principalColumn: "payment_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Subscription",
                columns: table => new
                {
                    sub_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    dataset_id = table.Column<int>(type: "int", nullable: true),
                    consumer_id = table.Column<int>(type: "int", nullable: true),
                    province_id = table.Column<int>(type: "int", nullable: true),
                    sub_start = table.Column<DateTime>(type: "datetime2", nullable: true),
                    sub_end = table.Column<DateTime>(type: "datetime2", nullable: true),
                    renewal_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    renewal_cycle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    total_price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    request_count = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscription", x => x.sub_id);
                    table.ForeignKey(
                        name: "FK_Subscription_DataConsumer_consumer_id",
                        column: x => x.consumer_id,
                        principalTable: "DataConsumer",
                        principalColumn: "consumer_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Subscription_Dataset_dataset_id",
                        column: x => x.dataset_id,
                        principalTable: "Dataset",
                        principalColumn: "dataset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Subscription_Province_province_id",
                        column: x => x.province_id,
                        principalTable: "Province",
                        principalColumn: "province_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_APIKey_api_purchase_id",
                table: "APIKey",
                column: "api_purchase_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIKey_consumer_id",
                table: "APIKey",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIKey_key_value",
                table: "APIKey",
                column: "key_value",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_APIPackage_api_key",
                table: "APIPackage",
                column: "api_key",
                unique: true,
                filter: "[api_key] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_APIPackage_consumer_id",
                table: "APIPackage",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIPackage_dataset_id",
                table: "APIPackage",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIPackagePurchase_consumer_id",
                table: "APIPackagePurchase",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIPackagePurchase_district_id",
                table: "APIPackagePurchase",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_APIPackagePurchase_province_id",
                table: "APIPackagePurchase",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_DataConsumer_user_id",
                table: "DataConsumer",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataPackagePurchase_consumer_id",
                table: "DataPackagePurchase",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_DataPackagePurchase_district_id",
                table: "DataPackagePurchase",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_DataPackagePurchase_province_id",
                table: "DataPackagePurchase",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_DataProvider_province_id",
                table: "DataProvider",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_DataProvider_user_id",
                table: "DataProvider",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_category",
                table: "Dataset",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_moderation_status",
                table: "Dataset",
                column: "moderation_status");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_PricingTierTierId",
                table: "Dataset",
                column: "PricingTierTierId");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_provider_id",
                table: "Dataset",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_status",
                table: "Dataset",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetModeration_dataset_id",
                table: "DatasetModeration",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetModeration_moderator_user_id",
                table: "DatasetModeration",
                column: "moderator_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRecords_charging_timestamp",
                table: "DatasetRecords",
                column: "charging_timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRecords_DatasetId",
                table: "DatasetRecords",
                column: "DatasetId");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRecords_district_id",
                table: "DatasetRecords",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRecords_province_id_district_id",
                table: "DatasetRecords",
                columns: new[] { "province_id", "district_id" });

            migrationBuilder.CreateIndex(
                name: "IX_District_province_id",
                table: "District",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_OneTimePurchase_consumer_id",
                table: "OneTimePurchase",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_OneTimePurchase_dataset_id",
                table: "OneTimePurchase",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_consumer_id",
                table: "Payment",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_payment_date",
                table: "Payment",
                column: "payment_date");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_status",
                table: "Payment",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_Payout_provider_id",
                table: "Payout",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "IX_RevenueShare_dataset_id",
                table: "RevenueShare",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_RevenueShare_payment_id",
                table: "RevenueShare",
                column: "payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_RevenueShare_provider_id",
                table: "RevenueShare",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_consumer_id",
                table: "Subscription",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_dataset_id",
                table: "Subscription",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_province_id",
                table: "Subscription",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPackagePurchase_consumer_id",
                table: "SubscriptionPackagePurchase",
                column: "consumer_id");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPackagePurchase_district_id",
                table: "SubscriptionPackagePurchase",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPackagePurchase_province_id",
                table: "SubscriptionPackagePurchase",
                column: "province_id");

            migrationBuilder.CreateIndex(
                name: "IX_User_email",
                table: "User",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_role",
                table: "User",
                column: "role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "APIKey");

            migrationBuilder.DropTable(
                name: "APIPackage");

            migrationBuilder.DropTable(
                name: "DataPackagePurchase");

            migrationBuilder.DropTable(
                name: "DatasetModeration");

            migrationBuilder.DropTable(
                name: "DatasetRecords");

            migrationBuilder.DropTable(
                name: "OneTimePurchase");

            migrationBuilder.DropTable(
                name: "Payout");

            migrationBuilder.DropTable(
                name: "RevenueShare");

            migrationBuilder.DropTable(
                name: "Subscription");

            migrationBuilder.DropTable(
                name: "SubscriptionPackagePurchase");

            migrationBuilder.DropTable(
                name: "SystemPricing");

            migrationBuilder.DropTable(
                name: "APIPackagePurchase");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "Dataset");

            migrationBuilder.DropTable(
                name: "District");

            migrationBuilder.DropTable(
                name: "DataConsumer");

            migrationBuilder.DropTable(
                name: "DataProvider");

            migrationBuilder.DropTable(
                name: "PricingTier");

            migrationBuilder.DropTable(
                name: "Province");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
