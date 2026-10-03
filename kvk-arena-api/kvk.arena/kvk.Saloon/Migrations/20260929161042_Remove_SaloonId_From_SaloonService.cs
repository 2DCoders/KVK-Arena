using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Remove_SaloonId_From_SaloonService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaloonServices_Saloons_SaloonId",
                schema: "saloon",
                table: "SaloonServices");

            migrationBuilder.DropIndex(
                name: "IX_SaloonServices_SaloonId",
                schema: "saloon",
                table: "SaloonServices");

            migrationBuilder.DropColumn(
                name: "SaloonId",
                schema: "saloon",
                table: "SaloonServices");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SaloonId",
                schema: "saloon",
                table: "SaloonServices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_SaloonServices_SaloonId",
                schema: "saloon",
                table: "SaloonServices",
                column: "SaloonId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaloonServices_Saloons_SaloonId",
                schema: "saloon",
                table: "SaloonServices",
                column: "SaloonId",
                principalSchema: "saloon",
                principalTable: "Saloons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
