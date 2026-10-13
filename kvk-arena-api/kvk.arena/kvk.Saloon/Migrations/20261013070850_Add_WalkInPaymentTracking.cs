using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Add_WalkInPaymentTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PaymentType",
                schema: "saloon",
                table: "SaloonBookings",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                schema: "saloon",
                table: "SaloonBookings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsWalkIn",
                schema: "saloon",
                table: "SaloonBookings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                schema: "saloon",
                table: "SaloonBookings",
                type: "timestamp without time zone",
                nullable: true);

            // The old reports treated confirmed/in-progress/completed bookings as paid.
            // Preserve that history; new walk-ins explicitly start unpaid.
            migrationBuilder.Sql("""
                UPDATE saloon."SaloonBookings"
                SET "IsPaid" = TRUE, "PaidAt" = "CreatedAt"
                WHERE "Status" IN (2, 3, 4);

                UPDATE saloon."SaloonBookings"
                SET "IsWalkIn" = TRUE
                WHERE "Notes" LIKE 'Walk-in%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                schema: "saloon",
                table: "SaloonBookings");

            migrationBuilder.DropColumn(
                name: "IsWalkIn",
                schema: "saloon",
                table: "SaloonBookings");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                schema: "saloon",
                table: "SaloonBookings");

            migrationBuilder.AlterColumn<int>(
                name: "PaymentType",
                schema: "saloon",
                table: "SaloonBookings",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
