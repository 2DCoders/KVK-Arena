using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class TrackSmsAttempts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SmsAttempts",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmittedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    AdminBatch = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Segments = table.Column<int>(type: "integer", nullable: true),
                    MaintenanceCharge = table.Column<decimal>(type: "numeric", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SmsAttempts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SmsAttempt_TenantId",
                schema: "identity",
                table: "SmsAttempts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SmsAttempts_TenantId_AdminBatch_SubmittedUtc",
                schema: "identity",
                table: "SmsAttempts",
                columns: new[] { "TenantId", "AdminBatch", "SubmittedUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SmsAttempts",
                schema: "identity");
        }
    }
}
