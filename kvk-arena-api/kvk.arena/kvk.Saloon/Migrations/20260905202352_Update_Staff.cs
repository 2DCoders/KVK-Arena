using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Update_Staff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaloonStaffs_Saloons_SaloonId",
                schema: "saloon",
                table: "SaloonStaffs");

            migrationBuilder.DropIndex(
                name: "IX_SaloonStaffs_SaloonId",
                schema: "saloon",
                table: "SaloonStaffs");

            migrationBuilder.DropColumn(
                name: "SaloonId",
                schema: "saloon",
                table: "SaloonStaffs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SaloonId",
                schema: "saloon",
                table: "SaloonStaffs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffs_SaloonId",
                schema: "saloon",
                table: "SaloonStaffs",
                column: "SaloonId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaloonStaffs_Saloons_SaloonId",
                schema: "saloon",
                table: "SaloonStaffs",
                column: "SaloonId",
                principalSchema: "saloon",
                principalTable: "Saloons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
