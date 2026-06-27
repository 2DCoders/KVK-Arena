using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Update_Gaminghold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentId",
                schema: "badminton",
                table: "CourtBookings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentId",
                schema: "badminton",
                table: "CourtBookings");
        }
    }
}
