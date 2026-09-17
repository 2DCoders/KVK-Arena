using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Update_GamingSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookingId",
                schema: "game",
                table: "GamingSlots");

            migrationBuilder.DropColumn(
                name: "IsBooked",
                schema: "game",
                table: "GamingSlots");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BookingId",
                schema: "game",
                table: "GamingSlots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBooked",
                schema: "game",
                table: "GamingSlots",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
