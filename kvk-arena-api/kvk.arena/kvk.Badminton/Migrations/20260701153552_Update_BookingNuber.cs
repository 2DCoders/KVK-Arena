using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Update_BookingNuber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BookingNumber",
                schema: "badminton",
                table: "CourtBookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PaymentType",
                schema: "badminton",
                table: "CourtBookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_BookingHolds_CourtId",
                schema: "badminton",
                table: "BookingHolds",
                column: "CourtId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHolds_CourtSlotId",
                schema: "badminton",
                table: "BookingHolds",
                column: "CourtSlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingHolds_CourtSlots_CourtSlotId",
                schema: "badminton",
                table: "BookingHolds",
                column: "CourtSlotId",
                principalSchema: "badminton",
                principalTable: "CourtSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingHolds_Courts_CourtId",
                schema: "badminton",
                table: "BookingHolds",
                column: "CourtId",
                principalSchema: "badminton",
                principalTable: "Courts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingHolds_CourtSlots_CourtSlotId",
                schema: "badminton",
                table: "BookingHolds");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingHolds_Courts_CourtId",
                schema: "badminton",
                table: "BookingHolds");

            migrationBuilder.DropIndex(
                name: "IX_BookingHolds_CourtId",
                schema: "badminton",
                table: "BookingHolds");

            migrationBuilder.DropIndex(
                name: "IX_BookingHolds_CourtSlotId",
                schema: "badminton",
                table: "BookingHolds");

            migrationBuilder.DropColumn(
                name: "BookingNumber",
                schema: "badminton",
                table: "CourtBookings");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                schema: "badminton",
                table: "CourtBookings");
        }
    }
}
