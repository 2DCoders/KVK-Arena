using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class Update_DayEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NextWorkingDate",
                schema: "badminton",
                table: "BadmintonDayEnds",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextWorkingDate",
                schema: "badminton",
                table: "BadmintonDayEnds");
        }
    }
}
