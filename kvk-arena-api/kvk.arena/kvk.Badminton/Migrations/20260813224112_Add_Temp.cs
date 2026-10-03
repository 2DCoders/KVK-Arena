using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Add_Temp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourtBookingTemporaries",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtId = table.Column<Guid>(type: "uuid", nullable: false),
                    MemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    NumberOfSlots = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    CouponCode = table.Column<string>(type: "text", nullable: true),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PaymentProof = table.Column<byte[]>(type: "bytea", nullable: true),
                    IsHalfPayment = table.Column<bool>(type: "boolean", nullable: false),
                    IsMigrated = table.Column<bool>(type: "boolean", nullable: false),
                    MigratedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtBookingTemporaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourtBookingTemporarySchedules",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtBookingTemporaryId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<string>(type: "text", nullable: false),
                    SlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtBookingTemporarySchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourtBookingTemporarySchedules_CourtBookingTemporaries_Cour~",
                        column: x => x.CourtBookingTemporaryId,
                        principalSchema: "badminton",
                        principalTable: "CourtBookingTemporaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookingTemporary_TenantId",
                schema: "badminton",
                table: "CourtBookingTemporaries",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookingTemporary_TenantId_CreatedAt",
                schema: "badminton",
                table: "CourtBookingTemporaries",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookingTemporarySchedule_TenantId",
                schema: "badminton",
                table: "CourtBookingTemporarySchedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookingTemporarySchedule_TenantId_CreatedAt",
                schema: "badminton",
                table: "CourtBookingTemporarySchedules",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtBookingTemporarySchedules_CourtBookingTemporaryId",
                schema: "badminton",
                table: "CourtBookingTemporarySchedules",
                column: "CourtBookingTemporaryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtBookingTemporarySchedules",
                schema: "badminton");

            migrationBuilder.DropTable(
                name: "CourtBookingTemporaries",
                schema: "badminton");
        }
    }
}
