using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class AddCashierSlipReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CashierSlipReservations",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HoldToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    PaymentDueUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    SlotHoldIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    FinalSlotAmounts = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    CouponBasePrices = table.Column<decimal[]>(type: "numeric[]", nullable: true),
                    CouponCode = table.Column<string>(type: "text", nullable: true),
                    LimitedCouponId = table.Column<Guid>(type: "uuid", nullable: true),
                    CouponDiscount = table.Column<decimal>(type: "numeric", nullable: false),
                    IsPromotion = table.Column<bool>(type: "boolean", nullable: false),
                    Approved = table.Column<bool>(type: "boolean", nullable: false),
                    SmsSent = table.Column<bool>(type: "boolean", nullable: false),
                    SlipRevision = table.Column<Guid>(type: "uuid", nullable: true),
                    Slip = table.Column<byte[]>(type: "bytea", nullable: true),
                    SlipContentType = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CashierSlipReservations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CashierSlipReservation_TenantId",
                schema: "badminton",
                table: "CashierSlipReservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CashierSlipReservation_TenantId_CreatedAt",
                schema: "badminton",
                table: "CashierSlipReservations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CashierSlipReservations_HoldToken",
                schema: "badminton",
                table: "CashierSlipReservations",
                column: "HoldToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CashierSlipReservations",
                schema: "badminton");
        }
    }
}
