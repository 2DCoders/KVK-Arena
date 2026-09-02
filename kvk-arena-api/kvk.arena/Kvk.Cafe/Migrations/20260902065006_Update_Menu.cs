using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kvk.Cafe.Migrations
{
    /// <inheritdoc />
    public partial class Update_Menu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PortionSize",
                schema: "cafe",
                table: "Menus",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PortionSize",
                schema: "cafe",
                table: "Menus");
        }
    }
}
