using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Add_DayEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DayEnds",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NextWorkingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CashFromPrevDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ExpectedCashTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ActualCashCount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Discrepancy = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remark = table.Column<string>(type: "text", nullable: false),
                    HoldForNextDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DayEnds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DayEnd_CurrentDate",
                schema: "gym",
                table: "DayEnds",
                column: "CurrentDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DayEnds",
                schema: "gym");
        }
    }
}
