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
                    api_price_per_call = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    subscription_price_per_region = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    provider_commission_percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    admin_commission_percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
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
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Province", x => x.province_id);
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
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataProvider", x => x.provider_id);
                    table.ForeignKey(
                        name: "FK_DataProvider_User_user_id",
                        column: x => x.user_id,
                        principalTable: "User",
                        principalColumn: "user_id",
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
                name: "Dataset",
                columns: table => new
                {
                    dataset_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    provider_id = table.Column<int>(type: "int", nullable: true),
                    port_id = table.Column<int>(type: "int", nullable: true),
                    tier_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    category = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    data_format = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    data_size_mb = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    upload_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    last_updated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    visibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    moderation_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    file_path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
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
                        name: "FK_Dataset_PricingTier_tier_id",
                        column: x => x.tier_id,
                        principalTable: "PricingTier",
                        principalColumn: "tier_id",
                        onDelete: ReferentialAction.Restrict);
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
                name: "IX_DataConsumer_user_id",
                table: "DataConsumer",
                column: "user_id",
                unique: true);

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
                name: "IX_Dataset_provider_id",
                table: "Dataset",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_status",
                table: "Dataset",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_tier_id",
                table: "Dataset",
                column: "tier_id");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetModeration_dataset_id",
                table: "DatasetModeration",
                column: "dataset_id");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetModeration_moderator_user_id",
                table: "DatasetModeration",
                column: "moderator_user_id");

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
                name: "APIPackage");

            migrationBuilder.DropTable(
                name: "DatasetModeration");

            migrationBuilder.DropTable(
                name: "OneTimePurchase");

            migrationBuilder.DropTable(
                name: "Payout");

            migrationBuilder.DropTable(
                name: "RevenueShare");

            migrationBuilder.DropTable(
                name: "Subscription");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "Dataset");

            migrationBuilder.DropTable(
                name: "Province");

            migrationBuilder.DropTable(
                name: "DataConsumer");

            migrationBuilder.DropTable(
                name: "DataProvider");

            migrationBuilder.DropTable(
                name: "PricingTier");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
