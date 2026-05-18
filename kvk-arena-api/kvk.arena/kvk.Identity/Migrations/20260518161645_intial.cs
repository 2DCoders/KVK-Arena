using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class intial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.RenameTable(
                name: "StaffRoles",
                newName: "StaffRoles",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "Staff",
                newName: "Staff",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "Roles",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "RolePermissions",
                newName: "RolePermissions",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "ApplicationPermissions",
                newName: "ApplicationPermissions",
                newSchema: "identity");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "StaffRoles",
                schema: "identity",
                newName: "StaffRoles");

            migrationBuilder.RenameTable(
                name: "Staff",
                schema: "identity",
                newName: "Staff");

            migrationBuilder.RenameTable(
                name: "Roles",
                schema: "identity",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "RolePermissions",
                schema: "identity",
                newName: "RolePermissions");

            migrationBuilder.RenameTable(
                name: "ApplicationPermissions",
                schema: "identity",
                newName: "ApplicationPermissions");
        }
    }
}
