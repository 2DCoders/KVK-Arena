using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Add_SystemSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemSettings",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValue: new Guid("7b06f7f7-4a17-45b2-9b7c-2f6f0b49b2e2")),
                    PreviousDayEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentDay = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NextWorkingDay = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastDayEndCheckedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDayEndCompleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                    table.CheckConstraint("CK_SystemSetting_Singleton", "\"Id\" = '7b06f7f7-4a17-45b2-9b7c-2f6f0b49b2e2'");
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemSettings",
                schema: "gym");
        }
    }
}
