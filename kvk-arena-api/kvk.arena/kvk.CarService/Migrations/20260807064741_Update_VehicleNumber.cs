using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.CarService.Migrations
{
    /// <inheritdoc />
    public partial class Update_VehicleNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VehicleNumber",
                schema: "carService",
                table: "CarWashOrders",
                type: "character varying(15)",
                maxLength: 15,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VehicleNumber",
                schema: "carService",
                table: "CarWashOrders");
        }
    }
}
