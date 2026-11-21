using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminSms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminSmsBatches",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmittedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    GroupName = table.Column<string>(type: "text", nullable: true),
                    RecipientsJson = table.Column<string>(type: "text", nullable: false),
                    SegmentsPerRecipient = table.Column<int>(type: "integer", nullable: false),
                    ReservedSegments = table.Column<int>(type: "integer", nullable: false),
                    AcceptedSegments = table.Column<int>(type: "integer", nullable: false),
                    MonthlyLimit = table.Column<int>(type: "integer", nullable: false),
                    SegmentPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    MaintenanceCharge = table.Column<decimal>(type: "numeric", nullable: false),
                    Completed = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminSmsBatches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AdminSmsGroups",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MemberIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminSmsGroups", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminSmsBatch_TenantId",
                schema: "identity",
                table: "AdminSmsBatches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminSmsGroup_TenantId",
                schema: "identity",
                table: "AdminSmsGroups",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminSmsBatches",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "AdminSmsGroups",
                schema: "identity");
        }
    }
}
