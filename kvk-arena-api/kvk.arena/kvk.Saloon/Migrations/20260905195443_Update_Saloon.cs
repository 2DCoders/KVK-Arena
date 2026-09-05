using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Update_Saloon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "saloon",
                table: "Saloons");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "saloon",
                table: "Saloons",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
