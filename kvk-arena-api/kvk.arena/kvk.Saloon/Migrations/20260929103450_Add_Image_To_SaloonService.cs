using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Add_Image_To_SaloonService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Image",
                schema: "saloon",
                table: "SaloonServices",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                schema: "saloon",
                table: "SaloonServices");
        }
    }
}
