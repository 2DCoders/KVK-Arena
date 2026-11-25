using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class AddGamingCashierSlipSmsStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SmsSent",
                schema: "game",
                table: "GamingCashierSlips",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SmsSent",
                schema: "game",
                table: "GamingCashierSlips");
        }
    }
}
