using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Add_StaffModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StaffModules",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffModules_Staff_StaffId",
                        column: x => x.StaffId,
                        principalSchema: "identity",
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StaffModule_TenantId",
                schema: "identity",
                table: "StaffModules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffModule_TenantId_CreatedAt",
                schema: "identity",
                table: "StaffModules",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffModules_StaffId_ModuleName",
                schema: "identity",
                table: "StaffModules",
                columns: new[] { "StaffId", "ModuleName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StaffModules",
                schema: "identity");
        }
    }
}
