using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class AddWalkInBookingGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "WalkInId",
                schema: "badminton",
                table: "CourtBookings",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WalkInId",
                schema: "badminton",
                table: "CourtBookings");
        }
    }
}
