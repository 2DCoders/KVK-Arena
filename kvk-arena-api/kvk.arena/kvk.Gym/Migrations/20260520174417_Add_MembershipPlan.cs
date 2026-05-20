using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Add_MembershipPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MembershipPlan",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.AddColumn<Guid>(
                name: "MembershipPlanId",
                schema: "gym",
                table: "Memberships",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Otp",
                schema: "gym",
                table: "Memberships",
                type: "integer",
                maxLength: 4,
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "MembershipPlans",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DurationInDays = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<int>(type: "integer", nullable: false),
                    Features = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MembershipPlans", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_MembershipPlanId",
                schema: "gym",
                table: "Memberships",
                column: "MembershipPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Memberships_MembershipPlans_MembershipPlanId",
                schema: "gym",
                table: "Memberships",
                column: "MembershipPlanId",
                principalSchema: "gym",
                principalTable: "MembershipPlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Memberships_MembershipPlans_MembershipPlanId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropTable(
                name: "MembershipPlans",
                schema: "gym");

            migrationBuilder.DropIndex(
                name: "IX_Memberships_MembershipPlanId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "MembershipPlanId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "Otp",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.AddColumn<int>(
                name: "MembershipPlan",
                schema: "gym",
                table: "Memberships",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
