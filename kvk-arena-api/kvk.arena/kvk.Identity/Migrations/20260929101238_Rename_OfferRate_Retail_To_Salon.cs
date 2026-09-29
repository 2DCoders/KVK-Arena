using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Rename_OfferRate_Retail_To_Salon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RateRetail",
                schema: "identity",
                table: "OfferRates",
                newName: "RateSalon");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RateSalon",
                schema: "identity",
                table: "OfferRates",
                newName: "RateRetail");
        }
    }
}
