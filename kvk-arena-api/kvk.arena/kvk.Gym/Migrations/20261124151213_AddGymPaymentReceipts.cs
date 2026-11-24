using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class AddGymPaymentReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentReceipts",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentRecordId = table.Column<Guid>(type: "uuid", nullable: true),
                    DayPassMemberId = table.Column<Guid>(type: "uuid", nullable: true),
                    Document = table.Column<byte[]>(type: "bytea", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentReceipts_DayPassMembers_DayPassMemberId",
                        column: x => x.DayPassMemberId,
                        principalSchema: "gym",
                        principalTable: "DayPassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentReceipts_PaymentRecords_PaymentRecordId",
                        column: x => x.PaymentRecordId,
                        principalSchema: "gym",
                        principalTable: "PaymentRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GymPaymentReceipt_TenantId",
                schema: "gym",
                table: "PaymentReceipts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GymPaymentReceipt_TenantId_CreatedAt",
                schema: "gym",
                table: "PaymentReceipts",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentReceipts_DayPassMemberId",
                schema: "gym",
                table: "PaymentReceipts",
                column: "DayPassMemberId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentReceipts_PaymentRecordId",
                schema: "gym",
                table: "PaymentReceipts",
                column: "PaymentRecordId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentReceipts",
                schema: "gym");
        }
    }
}
