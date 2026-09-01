using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kvk.Cafe.Migrations
{
    /// <inheritdoc />
    public partial class Add_Menu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Menus",
                schema: "cafe",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Image = table.Column<byte[]>(type: "bytea", nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Facts = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Ingredients = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PreparationTimeInMinutes = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Menus", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Menu_TenantId",
                schema: "cafe",
                table: "Menus",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Menu_TenantId_CreatedAt",
                schema: "cafe",
                table: "Menus",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Menus",
                schema: "cafe");
        }
    }
}
