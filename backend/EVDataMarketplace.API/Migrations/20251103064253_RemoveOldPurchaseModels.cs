using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EVDataMarketplace.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOldPurchaseModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dataset_PricingTier_PricingTierTierId",
                table: "Dataset");

            migrationBuilder.DropTable(
                name: "PricingTier");

            migrationBuilder.DropIndex(
                name: "IX_Dataset_PricingTierTierId",
                table: "Dataset");

            migrationBuilder.DropColumn(
                name: "PricingTierTierId",
                table: "Dataset");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PricingTierTierId",
                table: "Dataset",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PricingTier",
                columns: table => new
                {
                    tier_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    admin_commission_percent = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    api_price_per_call = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    base_price_per_mb = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    provider_commission_percent = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    subscription_price_per_region = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    tier_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingTier", x => x.tier_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dataset_PricingTierTierId",
                table: "Dataset",
                column: "PricingTierTierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dataset_PricingTier_PricingTierTierId",
                table: "Dataset",
                column: "PricingTierTierId",
                principalTable: "PricingTier",
                principalColumn: "tier_id");
        }
    }
}
