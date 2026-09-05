#nullable disable

using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "saloon");

            migrationBuilder.CreateTable(
                name: "SaloonDayEnds",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    NextWorkingDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpectedCashTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ActualCashCount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Discrepancy = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remark = table.Column<string>(type: "text", nullable: false),
                    HoldForNextDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CashFromPrevDay = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonDayEnds", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SaloonDayEnds",
                schema: "saloon");
        }
    }
}
