using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Add_CalenderHolidays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CalenderHolidays",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Year = table.Column<string>(type: "text", nullable: false),
                    Month = table.Column<string>(type: "text", nullable: false),
                    Day = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsImported = table.Column<bool>(type: "boolean", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: true),
                    DurationDays = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalenderHolidays", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalenderHolidays_TenantId",
                schema: "identity",
                table: "CalenderHolidays",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CalenderHolidays_TenantId_CreatedAt",
                schema: "identity",
                table: "CalenderHolidays",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CalenderHolidays",
                schema: "identity");
        }
    }
}
