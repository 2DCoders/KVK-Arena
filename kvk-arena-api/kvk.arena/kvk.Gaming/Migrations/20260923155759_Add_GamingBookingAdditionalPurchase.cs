using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Add_GamingBookingAdditionalPurchase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GamingBookingAdditionalPurchases",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingBookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdditionalPurchaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingBookingAdditionalPurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingBookingAdditionalPurchases_AdditionalPurchases_Additi~",
                        column: x => x.AdditionalPurchaseId,
                        principalSchema: "game",
                        principalTable: "AdditionalPurchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookingAdditionalPurchases_GamingBookings_GamingBooki~",
                        column: x => x.GamingBookingId,
                        principalSchema: "game",
                        principalTable: "GamingBookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamingBookingHoldAdditionalPurchases",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingBookingHoldId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdditionalPurchaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingBookingHoldAdditionalPurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingBookingHoldAdditionalPurchases_AdditionalPurchases_Ad~",
                        column: x => x.AdditionalPurchaseId,
                        principalSchema: "game",
                        principalTable: "AdditionalPurchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookingHoldAdditionalPurchases_GamingBookingHolds_Gam~",
                        column: x => x.GamingBookingHoldId,
                        principalSchema: "game",
                        principalTable: "GamingBookingHolds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingAdditionalPurchase_TenantId",
                schema: "game",
                table: "GamingBookingAdditionalPurchases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingAdditionalPurchase_TenantId_CreatedAt",
                schema: "game",
                table: "GamingBookingAdditionalPurchases",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingAdditionalPurchases_AdditionalPurchaseId",
                schema: "game",
                table: "GamingBookingAdditionalPurchases",
                column: "AdditionalPurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingAdditionalPurchases_GamingBookingId",
                schema: "game",
                table: "GamingBookingAdditionalPurchases",
                column: "GamingBookingId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHoldAdditionalPurchase_TenantId",
                schema: "game",
                table: "GamingBookingHoldAdditionalPurchases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHoldAdditionalPurchase_TenantId_CreatedAt",
                schema: "game",
                table: "GamingBookingHoldAdditionalPurchases",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHoldAdditionalPurchases_AdditionalPurchaseId",
                schema: "game",
                table: "GamingBookingHoldAdditionalPurchases",
                column: "AdditionalPurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHoldAdditionalPurchases_GamingBookingHoldId",
                schema: "game",
                table: "GamingBookingHoldAdditionalPurchases",
                column: "GamingBookingHoldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GamingBookingAdditionalPurchases",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingBookingHoldAdditionalPurchases",
                schema: "game");
        }
    }
}
