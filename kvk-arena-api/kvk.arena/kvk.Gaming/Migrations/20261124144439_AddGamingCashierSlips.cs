using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gaming.Migrations
{
    /// <inheritdoc />
    public partial class AddGamingCashierSlips : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GamingCashierSlips",
                schema: "game",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    HoldIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    Amounts = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    PaymentDueUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Revision = table.Column<Guid>(type: "uuid", nullable: true),
                    Document = table.Column<byte[]>(type: "bytea", nullable: true),
                    ContentType = table.Column<string>(type: "text", nullable: true),
                    Approved = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamingCashierSlips", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GamingCashierSlip_TenantId",
                schema: "game",
                table: "GamingCashierSlips",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GamingCashierSlip_TenantId_CreatedAt",
                schema: "game",
                table: "GamingCashierSlips",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GamingCashierSlips",
                schema: "game");
        }
    }
}
