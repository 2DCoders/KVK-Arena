using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class add_PaymentRcord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentRecords",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MembershipId = table.Column<Guid>(type: "uuid", nullable: false),
                    MemberPaymentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PaymentStatus = table.Column<int>(type: "integer", nullable: false),
                    MemberShipStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MemberShipRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MemberShipEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TransactionReference = table.Column<string>(type: "text", nullable: true),
                    MembershipNumber = table.Column<string>(type: "text", nullable: true),
                    MembershipPlanId = table.Column<Guid>(type: "uuid", nullable: true),
                    MembershipPlanTitle = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentRecords_Memberships_MembershipId",
                        column: x => x.MembershipId,
                        principalSchema: "gym",
                        principalTable: "Memberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Membership_TenantId",
                schema: "gym",
                table: "Memberships",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Membership_TenantId_CreatedAt",
                schema: "gym",
                table: "Memberships",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipPlan_TenantId",
                schema: "gym",
                table: "MembershipPlans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipPlan_TenantId_CreatedAt",
                schema: "gym",
                table: "MembershipPlans",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MemberPayment_TenantId",
                schema: "gym",
                table: "MemberPayments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberPayment_TenantId_CreatedAt",
                schema: "gym",
                table: "MemberPayments",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MemberPayments_MembershipId",
                schema: "gym",
                table: "MemberPayments",
                column: "MembershipId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberAttendance_TenantId",
                schema: "gym",
                table: "MemberAttendances",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberAttendance_TenantId_CreatedAt",
                schema: "gym",
                table: "MemberAttendances",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRecord_MembershipId",
                schema: "gym",
                table: "PaymentRecords",
                column: "MembershipId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRecord_TenantId",
                schema: "gym",
                table: "PaymentRecords",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRecord_TenantId_CreatedAt",
                schema: "gym",
                table: "PaymentRecords",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_MemberPayments_Memberships_MembershipId",
                schema: "gym",
                table: "MemberPayments",
                column: "MembershipId",
                principalSchema: "gym",
                principalTable: "Memberships",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberPayments_Memberships_MembershipId",
                schema: "gym",
                table: "MemberPayments");

            migrationBuilder.DropTable(
                name: "PaymentRecords",
                schema: "gym");

            migrationBuilder.DropIndex(
                name: "IX_Membership_TenantId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropIndex(
                name: "IX_Membership_TenantId_CreatedAt",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropIndex(
                name: "IX_MembershipPlan_TenantId",
                schema: "gym",
                table: "MembershipPlans");

            migrationBuilder.DropIndex(
                name: "IX_MembershipPlan_TenantId_CreatedAt",
                schema: "gym",
                table: "MembershipPlans");

            migrationBuilder.DropIndex(
                name: "IX_MemberPayment_TenantId",
                schema: "gym",
                table: "MemberPayments");

            migrationBuilder.DropIndex(
                name: "IX_MemberPayment_TenantId_CreatedAt",
                schema: "gym",
                table: "MemberPayments");

            migrationBuilder.DropIndex(
                name: "IX_MemberPayments_MembershipId",
                schema: "gym",
                table: "MemberPayments");

            migrationBuilder.DropIndex(
                name: "IX_MemberAttendance_TenantId",
                schema: "gym",
                table: "MemberAttendances");

            migrationBuilder.DropIndex(
                name: "IX_MemberAttendance_TenantId_CreatedAt",
                schema: "gym",
                table: "MemberAttendances");
        }
    }
}
