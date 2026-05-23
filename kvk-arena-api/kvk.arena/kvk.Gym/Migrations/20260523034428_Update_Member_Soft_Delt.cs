using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Update_Member_Soft_Delt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_MemberPayments_MembershipId",
                schema: "gym",
                table: "MemberPayments",
                newName: "IX_MemberPayment_MembershipId");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "gym",
                table: "Memberships",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "gym",
                table: "Memberships",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_MemberAttendance_MembershipId",
                schema: "gym",
                table: "MemberAttendances",
                column: "MembershipId");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberAttendances_Memberships_MembershipId",
                schema: "gym",
                table: "MemberAttendances",
                column: "MembershipId",
                principalSchema: "gym",
                principalTable: "Memberships",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberAttendances_Memberships_MembershipId",
                schema: "gym",
                table: "MemberAttendances");

            migrationBuilder.DropIndex(
                name: "IX_MemberAttendance_MembershipId",
                schema: "gym",
                table: "MemberAttendances");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.RenameIndex(
                name: "IX_MemberPayment_MembershipId",
                schema: "gym",
                table: "MemberPayments",
                newName: "IX_MemberPayments_MembershipId");
        }
    }
}
