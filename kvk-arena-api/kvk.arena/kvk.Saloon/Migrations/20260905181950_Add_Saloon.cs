#nullable disable

using Microsoft.EntityFrameworkCore.Migrations;

namespace kvk.Saloon.Migrations
{
    /// <inheritdoc />
    public partial class Add_Saloon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Saloons",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    BranchId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Saloons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SaloonBookings",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    MemberId = table.Column<string>(type: "text", nullable: true),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonBookings_Saloons_SaloonId",
                        column: x => x.SaloonId,
                        principalSchema: "saloon",
                        principalTable: "Saloons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonServices",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    BufferMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonServices_Saloons_SaloonId",
                        column: x => x.SaloonId,
                        principalSchema: "saloon",
                        principalTable: "Saloons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonSlotConfigurations",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    SlotIntervalMinutes = table.Column<int>(type: "integer", nullable: false),
                    MaxBookingsPerSlot = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonSlotConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonSlotConfigurations_Saloons_SaloonId",
                        column: x => x.SaloonId,
                        principalSchema: "saloon",
                        principalTable: "Saloons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonStaffs",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Designation = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonStaffs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonStaffs_Saloons_SaloonId",
                        column: x => x.SaloonId,
                        principalSchema: "saloon",
                        principalTable: "Saloons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonBookingServices",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonBookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonStaffId = table.Column<Guid>(type: "uuid", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonBookingServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonBookingServices_SaloonBookings_SaloonBookingId",
                        column: x => x.SaloonBookingId,
                        principalSchema: "saloon",
                        principalTable: "SaloonBookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SaloonBookingServices_SaloonServices_SaloonServiceId",
                        column: x => x.SaloonServiceId,
                        principalSchema: "saloon",
                        principalTable: "SaloonServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SaloonBookingServices_SaloonStaffs_SaloonStaffId",
                        column: x => x.SaloonStaffId,
                        principalSchema: "saloon",
                        principalTable: "SaloonStaffs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonStaffSchedules",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonStaffId = table.Column<int>(type: "integer", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StaffId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonStaffSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonStaffSchedules_SaloonStaffs_StaffId",
                        column: x => x.StaffId,
                        principalSchema: "saloon",
                        principalTable: "SaloonStaffs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaloonStaffServices",
                schema: "saloon",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonStaffId = table.Column<Guid>(type: "uuid", nullable: false),
                    SaloonServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaloonStaffServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaloonStaffServices_SaloonServices_SaloonServiceId",
                        column: x => x.SaloonServiceId,
                        principalSchema: "saloon",
                        principalTable: "SaloonServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SaloonStaffServices_SaloonStaffs_SaloonStaffId",
                        column: x => x.SaloonStaffId,
                        principalSchema: "saloon",
                        principalTable: "SaloonStaffs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBooking_TenantId",
                schema: "saloon",
                table: "SaloonBookings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBooking_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonBookings",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookings_SaloonId",
                schema: "saloon",
                table: "SaloonBookings",
                column: "SaloonId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookingService_TenantId",
                schema: "saloon",
                table: "SaloonBookingServices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookingService_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonBookingServices",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookingServices_SaloonBookingId",
                schema: "saloon",
                table: "SaloonBookingServices",
                column: "SaloonBookingId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookingServices_SaloonServiceId",
                schema: "saloon",
                table: "SaloonBookingServices",
                column: "SaloonServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonBookingServices_SaloonStaffId",
                schema: "saloon",
                table: "SaloonBookingServices",
                column: "SaloonStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Saloon_TenantId",
                schema: "saloon",
                table: "Saloons",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Saloon_TenantId_CreatedAt",
                schema: "saloon",
                table: "Saloons",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonService_TenantId",
                schema: "saloon",
                table: "SaloonServices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonService_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonServices",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonServices_SaloonId",
                schema: "saloon",
                table: "SaloonServices",
                column: "SaloonId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonSlotConfiguration_TenantId",
                schema: "saloon",
                table: "SaloonSlotConfigurations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonSlotConfiguration_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonSlotConfigurations",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonSlotConfigurations_SaloonId",
                schema: "saloon",
                table: "SaloonSlotConfigurations",
                column: "SaloonId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaff_TenantId",
                schema: "saloon",
                table: "SaloonStaffs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaff_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonStaffs",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffs_SaloonId",
                schema: "saloon",
                table: "SaloonStaffs",
                column: "SaloonId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffSchedule_TenantId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffSchedule_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffSchedules_StaffId",
                schema: "saloon",
                table: "SaloonStaffSchedules",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffService_TenantId",
                schema: "saloon",
                table: "SaloonStaffServices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffService_TenantId_CreatedAt",
                schema: "saloon",
                table: "SaloonStaffServices",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffServices_SaloonServiceId",
                schema: "saloon",
                table: "SaloonStaffServices",
                column: "SaloonServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_SaloonStaffServices_SaloonStaffId",
                schema: "saloon",
                table: "SaloonStaffServices",
                column: "SaloonStaffId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SaloonBookingServices",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonSlotConfigurations",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonStaffSchedules",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonStaffServices",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonBookings",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonServices",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "SaloonStaffs",
                schema: "saloon");

            migrationBuilder.DropTable(
                name: "Saloons",
                schema: "saloon");
        }
    }
}
