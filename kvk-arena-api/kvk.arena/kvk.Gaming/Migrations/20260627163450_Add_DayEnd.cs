using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class Add_DayEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GamingDayEnds",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpectedCashTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ActualCashCount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Discrepancy = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remark = table.Column<string>(type: "text", nullable: false),
                    HoldForNextDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CashFromPrevDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingDayEnds", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GamingDayEnds",
                schema: "game");
        }
    }
}
