using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminSmsContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminSmsContacts",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminSmsContacts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminSmsContact_TenantId",
                schema: "identity",
                table: "AdminSmsContacts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminSmsContacts_TenantId_Phone",
                schema: "identity",
                table: "AdminSmsContacts",
                columns: new[] { "TenantId", "Phone" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminSmsContacts",
                schema: "identity");
        }
    }
}
