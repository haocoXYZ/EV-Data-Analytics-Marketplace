using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EVDataMarketplace.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDatasetRecordsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DatasetRecords",
                columns: table => new
                {
                    RecordId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DatasetId = table.Column<int>(type: "int", nullable: false),
                    RecordData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RowNumber = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                });

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRecords_DatasetId",
                table: "DatasetRecords",
                column: "DatasetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DatasetRecords");
        }
    }
}
