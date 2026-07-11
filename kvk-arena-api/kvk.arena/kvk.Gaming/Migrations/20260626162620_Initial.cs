using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "game");

            migrationBuilder.CreateTable(
                name: "Games",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GamingCategories",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GamingSlotConfigurations",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    SlotDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SlotGapMinutes = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    IsActive = table.Column<decimal>(type: "numeric", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingSlotConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingSlotConfigurations_GamingCategories_GamingCategoryId",
                        column: x => x.GamingCategoryId,
                        principalSchema: "game",
                        principalTable: "GamingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamingStations",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    StationCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingStations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingStations_GamingCategories_GamingCategoryId",
                        column: x => x.GamingCategoryId,
                        principalSchema: "game",
                        principalTable: "GamingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamingSlots",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingStationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingSlotConfigurationId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    IsBooked = table.Column<bool>(type: "boolean", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    GamingCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingSlots_GamingCategories_GamingCategoryId",
                        column: x => x.GamingCategoryId,
                        principalSchema: "game",
                        principalTable: "GamingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GamingSlots_GamingSlotConfigurations_GamingSlotConfiguratio~",
                        column: x => x.GamingSlotConfigurationId,
                        principalSchema: "game",
                        principalTable: "GamingSlotConfigurations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GamingSlots_GamingStations_GamingStationId",
                        column: x => x.GamingStationId,
                        principalSchema: "game",
                        principalTable: "GamingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamingBookings",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingNumber = table.Column<string>(type: "text", nullable: false),
                    GamingCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingStationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GamingSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    CustomerPhone = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamingBookings_GamingCategories_GamingCategoryId",
                        column: x => x.GamingCategoryId,
                        principalSchema: "game",
                        principalTable: "GamingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookings_GamingSlots_GamingSlotId",
                        column: x => x.GamingSlotId,
                        principalSchema: "game",
                        principalTable: "GamingSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GamingBookings_GamingStations_GamingStationId",
                        column: x => x.GamingStationId,
                        principalSchema: "game",
                        principalTable: "GamingStations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Game_TenantId",
                schema: "game",
                table: "Games",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Game_TenantId_CreatedAt",
                schema: "game",
                table: "Games",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBooking_TenantId",
                schema: "game",
                table: "GamingBookings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBooking_TenantId_CreatedAt",
                schema: "game",
                table: "GamingBookings",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookings_BookingNumber",
                schema: "game",
                table: "GamingBookings",
                column: "BookingNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookings_GamingCategoryId",
                schema: "game",
                table: "GamingBookings",
                column: "GamingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookings_GamingSlotId",
                schema: "game",
                table: "GamingBookings",
                column: "GamingSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingBookings_GamingStationId",
                schema: "game",
                table: "GamingBookings",
                column: "GamingStationId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingCategory_TenantId",
                schema: "game",
                table: "GamingCategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingCategory_TenantId_CreatedAt",
                schema: "game",
                table: "GamingCategories",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlotConfiguration_TenantId",
                schema: "game",
                table: "GamingSlotConfigurations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlotConfiguration_TenantId_CreatedAt",
                schema: "game",
                table: "GamingSlotConfigurations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlotConfigurations_GamingCategoryId",
                schema: "game",
                table: "GamingSlotConfigurations",
                column: "GamingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlot_TenantId",
                schema: "game",
                table: "GamingSlots",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlot_TenantId_CreatedAt",
                schema: "game",
                table: "GamingSlots",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlots_GamingCategoryId",
                schema: "game",
                table: "GamingSlots",
                column: "GamingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlots_GamingSlotConfigurationId",
                schema: "game",
                table: "GamingSlots",
                column: "GamingSlotConfigurationId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingSlots_GamingStationId_StartTime",
                schema: "game",
                table: "GamingSlots",
                columns: new[] { "GamingStationId", "StartTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GamingStation_TenantId",
                schema: "game",
                table: "GamingStations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingStation_TenantId_CreatedAt",
                schema: "game",
                table: "GamingStations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GamingStations_GamingCategoryId",
                schema: "game",
                table: "GamingStations",
                column: "GamingCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Games",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingBookings",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingSlots",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingSlotConfigurations",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingStations",
                schema: "game");

            migrationBuilder.DropTable(
                name: "GamingCategories",
                schema: "game");
        }
    }
}
