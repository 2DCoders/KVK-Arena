using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Identity.Migrations
{
    /// <inheritdoc />
    public partial class Add_CouponCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OfferId",
                schema: "identity",
                table: "MemberEligibleOffers",
                newName: "TenantId");

            migrationBuilder.AddColumn<string>(
                name: "CouponCode",
                schema: "identity",
                table: "MemberEligibleOffers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRedeemed",
                schema: "identity",
                table: "MemberEligibleOffers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "RedeemedDate",
                schema: "identity",
                table: "MemberEligibleOffers",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_MemberEligibleOffer_TenantId",
                schema: "identity",
                table: "MemberEligibleOffers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberEligibleOffers_OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers",
                column: "OfferRateId");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberEligibleOffers_OfferRates_OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers",
                column: "OfferRateId",
                principalSchema: "identity",
                principalTable: "OfferRates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberEligibleOffers_OfferRates_OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropIndex(
                name: "IX_MemberEligibleOffer_TenantId",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropIndex(
                name: "IX_MemberEligibleOffers_OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropColumn(
                name: "CouponCode",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropColumn(
                name: "IsRedeemed",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropColumn(
                name: "OfferRateId",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.DropColumn(
                name: "RedeemedDate",
                schema: "identity",
                table: "MemberEligibleOffers");

            migrationBuilder.RenameColumn(
                name: "TenantId",
                schema: "identity",
                table: "MemberEligibleOffers",
                newName: "OfferId");
        }
    }
}
