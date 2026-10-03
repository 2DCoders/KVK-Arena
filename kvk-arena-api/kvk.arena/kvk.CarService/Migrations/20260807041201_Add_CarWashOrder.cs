using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.CarService.Migrations
{
    /// <inheritdoc />
    public partial class Add_CarWashOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarWashOrders",
                schema: "carService",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    VehicleType = table.Column<int>(type: "integer", nullable: false),
                    TotalMinutesSpent = table.Column<int>(type: "integer", nullable: false),
                    SubTotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Discount = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountedTotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentMethod = table.Column<int>(type: "integer", nullable: false),
                    CarWashOrderStatus = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarWashOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CarWashOrderPackages",
                schema: "carService",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CarWashOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    CarWashPackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarWashOrderPackages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarWashOrderPackages_CarWashOrders_CarWashOrderId",
                        column: x => x.CarWashOrderId,
                        principalSchema: "carService",
                        principalTable: "CarWashOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CarWashOrderPackages_Packages_CarWashPackageId",
                        column: x => x.CarWashPackageId,
                        principalSchema: "carService",
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CarWashOrderServices",
                schema: "carService",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CarWashOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    CarWashServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarWashOrderServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarWashOrderServices_CarWashOrders_CarWashOrderId",
                        column: x => x.CarWashOrderId,
                        principalSchema: "carService",
                        principalTable: "CarWashOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CarWashOrderServices_Services_CarWashServiceId",
                        column: x => x.CarWashServiceId,
                        principalSchema: "carService",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderPackage_TenantId",
                schema: "carService",
                table: "CarWashOrderPackages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderPackages_CarWashOrderId",
                schema: "carService",
                table: "CarWashOrderPackages",
                column: "CarWashOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderPackages_CarWashPackageId",
                schema: "carService",
                table: "CarWashOrderPackages",
                column: "CarWashPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrder_TenantId",
                schema: "carService",
                table: "CarWashOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrder_TenantId_CreatedAt",
                schema: "carService",
                table: "CarWashOrders",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderService_TenantId",
                schema: "carService",
                table: "CarWashOrderServices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderServices_CarWashOrderId",
                schema: "carService",
                table: "CarWashOrderServices",
                column: "CarWashOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_CarWashOrderServices_CarWashServiceId",
                schema: "carService",
                table: "CarWashOrderServices",
                column: "CarWashServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarWashOrderPackages",
                schema: "carService");

            migrationBuilder.DropTable(
                name: "CarWashOrderServices",
                schema: "carService");

            migrationBuilder.DropTable(
                name: "CarWashOrders",
                schema: "carService");
        }
    }
}
