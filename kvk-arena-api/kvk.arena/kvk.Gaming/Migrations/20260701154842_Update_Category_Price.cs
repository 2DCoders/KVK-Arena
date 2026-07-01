using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Update_Category_Price : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                schema: "game",
                table: "GamingStations");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                schema: "game",
                table: "GamingCategories",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                schema: "game",
                table: "GamingCategories");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                schema: "game",
                table: "GamingStations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
