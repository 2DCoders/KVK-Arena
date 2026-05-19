using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "gym");

            migrationBuilder.CreateTable(
                name: "MemberAttendances",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MembershipId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScanTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FingerprintIndex = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<string>(type: "text", nullable: false),
                    RoomId = table.Column<string>(type: "text", nullable: true),
                    RawMetadata = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberAttendances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MemberPayments",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MembershipId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentType = table.Column<int>(type: "integer", nullable: false),
                    PaymentStatus = table.Column<int>(type: "integer", nullable: false),
                    MemberShipStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MemberShipRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MemberShipEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TransactionReference = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberPayments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Memberships",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityUserId = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MemberType = table.Column<int>(type: "integer", nullable: false),
                    Gender = table.Column<int>(type: "integer", nullable: false),
                    MembershipStatus = table.Column<int>(type: "integer", nullable: false),
                    MembershipNumber = table.Column<string>(type: "text", nullable: false),
                    DeviceFingerprintId1 = table.Column<string>(type: "text", nullable: true),
                    DeviceFingerprintId2 = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: true),
                    PasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Status = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memberships", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Membership_DeviceFingerprint1",
                schema: "gym",
                table: "Memberships",
                column: "DeviceFingerprintId1");

            migrationBuilder.CreateIndex(
                name: "IX_Membership_DeviceFingerprint2",
                schema: "gym",
                table: "Memberships",
                column: "DeviceFingerprintId2");

            migrationBuilder.CreateIndex(
                name: "IX_Membership_IdentityUserId",
                schema: "gym",
                table: "Memberships",
                column: "IdentityUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberAttendances",
                schema: "gym");

            migrationBuilder.DropTable(
                name: "MemberPayments",
                schema: "gym");

            migrationBuilder.DropTable(
                name: "Memberships",
                schema: "gym");
        }
    }
}
