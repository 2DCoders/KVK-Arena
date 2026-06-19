using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "badminton");

            migrationBuilder.CreateTable(
                name: "Courts",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PricePerSlot = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourtSlotConfigurations",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    SlotDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SlotGapMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<decimal>(type: "numeric", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtSlotConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourtSlotConfigurations_Courts_CourtId",
                        column: x => x.CourtId,
                        principalSchema: "badminton",
                        principalTable: "Courts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourtSlots",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourtSlots_Courts_CourtId",
                        column: x => x.CourtId,
                        principalSchema: "badminton",
                        principalTable: "Courts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourtBookings",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourtBookings_CourtSlots_CourtSlotId",
                        column: x => x.CourtSlotId,
                        principalSchema: "badminton",
                        principalTable: "CourtSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourtBookings_Courts_CourtId",
                        column: x => x.CourtId,
                        principalSchema: "badminton",
                        principalTable: "Courts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourtBooking_TenantId",
                schema: "badminton",
                table: "CourtBookings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtBooking_TenantId_CreatedAt",
                schema: "badminton",
                table: "CourtBookings",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookings_CourtId",
                schema: "badminton",
                table: "CourtBookings",
                column: "CourtId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookings_CourtSlotId",
                schema: "badminton",
                table: "CourtBookings",
                column: "CourtSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_Court_TenantId",
                schema: "badminton",
                table: "Courts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Court_TenantId_CreatedAt",
                schema: "badminton",
                table: "Courts",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlotConfiguration_TenantId",
                schema: "badminton",
                table: "CourtSlotConfigurations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlotConfiguration_TenantId_CreatedAt",
                schema: "badminton",
                table: "CourtSlotConfigurations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlotConfigurations_CourtId",
                schema: "badminton",
                table: "CourtSlotConfigurations",
                column: "CourtId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlot_TenantId",
                schema: "badminton",
                table: "CourtSlots",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlot_TenantId_CreatedAt",
                schema: "badminton",
                table: "CourtSlots",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtSlots_CourtId",
                schema: "badminton",
                table: "CourtSlots",
                column: "CourtId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtBookings",
                schema: "badminton");

            migrationBuilder.DropTable(
                name: "CourtSlotConfigurations",
                schema: "badminton");

            migrationBuilder.DropTable(
                name: "CourtSlots",
                schema: "badminton");

            migrationBuilder.DropTable(
                name: "Courts",
                schema: "badminton");
        }
    }
}
