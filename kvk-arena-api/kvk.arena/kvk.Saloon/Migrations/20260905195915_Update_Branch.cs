using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Update_Branch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BranchId",
                schema: "saloon",
                table: "Saloons");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                schema: "saloon",
                table: "Saloons",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
