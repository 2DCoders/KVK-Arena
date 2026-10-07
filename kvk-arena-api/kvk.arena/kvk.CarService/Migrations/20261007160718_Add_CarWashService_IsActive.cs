using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.CarService.Migrations
{
    /// <inheritdoc />
    public partial class Add_CarWashService_IsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "carService",
                table: "Services",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "carService",
                table: "Services");
        }
    }
}
