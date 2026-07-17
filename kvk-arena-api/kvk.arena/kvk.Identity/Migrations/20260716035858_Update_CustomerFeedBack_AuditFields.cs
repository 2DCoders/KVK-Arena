using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Update_CustomerFeedBack_AuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressedBy",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AddressedDate",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsAddressed",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedBy",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "identity",
                table: "CustomerFeedBacks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedBack_TenantId",
                schema: "identity",
                table: "CustomerFeedBacks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerFeedBack_TenantId_CreatedAt",
                schema: "identity",
                table: "CustomerFeedBacks",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CustomerFeedBack_TenantId",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropIndex(
                name: "IX_CustomerFeedBack_TenantId_CreatedAt",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "AddressedBy",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "AddressedDate",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "IsAddressed",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "identity",
                table: "CustomerFeedBacks");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "identity",
                table: "CustomerFeedBacks");
        }
    }
}
