using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Badminton.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberSlipReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MemberSlipReservations",
                schema: "badminton",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HoldToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentDueUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Approved = table.Column<bool>(type: "boolean", nullable: false),
                    Rejected = table.Column<bool>(type: "boolean", nullable: false),
                    SmsSent = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_MemberSlipReservations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemberSlipReservation_TenantId",
                schema: "badminton",
                table: "MemberSlipReservations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberSlipReservation_TenantId_CreatedAt",
                schema: "badminton",
                table: "MemberSlipReservations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MemberSlipReservations_HoldToken",
                schema: "badminton",
                table: "MemberSlipReservations",
                column: "HoldToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberSlipReservations",
                schema: "badminton");
        }
    }
}
