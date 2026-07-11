using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Add_DayEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerId",
                schema: "badminton",
                table: "CourtBookings");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                schema: "badminton",
                table: "CourtBookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                schema: "badminton",
                table: "CourtBookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "BadmintonDayEnds",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpectedCashTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ActualCashCount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Discrepancy = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remark = table.Column<string>(type: "text", nullable: false),
                    HoldForNextDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CashFromPrevDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BadmintonDayEnds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookingHolds",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourtSlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    PaymentIntentId = table.Column<string>(type: "text", nullable: true),
                    PaymentId = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingHolds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingHold_TenantId",
                schema: "badminton",
                table: "BookingHolds",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHold_TenantId_CreatedAt",
                schema: "badminton",
                table: "BookingHolds",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BadmintonDayEnds",
                schema: "badminton");

            migrationBuilder.DropTable(
                name: "BookingHolds",
                schema: "badminton");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                schema: "badminton",
                table: "CourtBookings");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                schema: "badminton",
                table: "CourtBookings");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                schema: "badminton",
                table: "CourtBookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
