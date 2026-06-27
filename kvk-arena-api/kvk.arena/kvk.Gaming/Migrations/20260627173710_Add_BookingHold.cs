using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Add_BookingHold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentIntentId",
                schema: "game",
                table: "GamingBookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "GamingBookingHolds",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingStationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    CustomerPhone = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentIntentId = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingBookingHolds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingBookingHolds_GamingCategories_GamingCategoryId",
                        column: x => x.GamingCategoryId,
                        principalSchema: "game",
                        principalTable: "GamingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookingHolds_GamingSlots_GamingSlotId",
                        column: x => x.GamingSlotId,
                        principalSchema: "game",
                        principalTable: "GamingSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookingHolds_GamingStations_GamingStationId",
                        column: x => x.GamingStationId,
                        principalSchema: "game",
                        principalTable: "GamingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHold_TenantId",
                schema: "game",
                table: "GamingBookingHolds",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHold_TenantId_CreatedAt",
                schema: "game",
                table: "GamingBookingHolds",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHolds_GamingCategoryId",
                schema: "game",
                table: "GamingBookingHolds",
                column: "GamingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHolds_GamingSlotId",
                schema: "game",
                table: "GamingBookingHolds",
                column: "GamingSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookingHolds_GamingStationId",
                schema: "game",
                table: "GamingBookingHolds",
                column: "GamingStationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GamingBookingHolds",
                schema: "game");

            migrationBuilder.DropColumn(
                name: "PaymentIntentId",
                schema: "game",
                table: "GamingBookings");
        }
    }
}
