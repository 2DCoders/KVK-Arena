using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Add_OfferRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OfferRates",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfferName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RateGym = table.Column<decimal>(type: "numeric", nullable: true),
                    RateBadminton = table.Column<decimal>(type: "numeric", nullable: true),
                    RateCarWash = table.Column<decimal>(type: "numeric", nullable: true),
                    RateGaming = table.Column<decimal>(type: "numeric", nullable: true),
                    RateCafe = table.Column<decimal>(type: "numeric", nullable: true),
                    RateRetail = table.Column<decimal>(type: "numeric", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: true),
                    IsPurchaseRequired = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    OfferType = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferRates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfferRate_TenantId",
                schema: "identity",
                table: "OfferRates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OfferRate_TenantId_CreatedAt",
                schema: "identity",
                table: "OfferRates",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfferRates",
                schema: "identity");
        }
    }
}
