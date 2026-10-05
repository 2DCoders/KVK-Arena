using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Update_StaffSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaloonStaffSchedules_SaloonStaffs_StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            migrationBuilder.DropIndex(
                name: "IX_SaloonStaffSchedules_StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            migrationBuilder.DropColumn(
                name: "StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            // Drop integer column
            migrationBuilder.DropColumn(
                name: "SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            // Recreate as UUID
            migrationBuilder.AddColumn<Guid>(
                name: "SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                type: "uuid",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffSchedules_SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "SaloonStaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaloonStaffSchedules_SaloonStaffs_SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "SaloonStaffId",
                principalSchema: "saloon",
                principalTable: "SaloonStaffs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaloonStaffSchedules_SaloonStaffs_SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            migrationBuilder.DropIndex(
                name: "IX_SaloonStaffSchedules_SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            // Drop UUID column
            migrationBuilder.DropColumn(
                name: "SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules");

            // Recreate as integer
            migrationBuilder.AddColumn<int>(
                name: "SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                type: "integer",
                nullable: false);

            // Recreate old StaffId column
            migrationBuilder.AddColumn<Guid>(
                name: "StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffSchedules_StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "StaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaloonStaffSchedules_SaloonStaffs_StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "StaffId",
                principalSchema: "saloon",
                principalTable: "SaloonStaffs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
