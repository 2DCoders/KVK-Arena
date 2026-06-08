using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Add_Trainer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Points",
                schema: "gym",
                table: "Memberships",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TrainerId",
                schema: "gym",
                table: "Memberships",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Trainer",
                schema: "gym",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Specialization = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
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
                    table.PrimaryKey("PK_Trainer", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Memberships_TrainerId",
                schema: "gym",
                table: "Memberships",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_Trainer_Email",
                schema: "gym",
                table: "Trainer",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trainer_TenantId",
                schema: "gym",
                table: "Trainer",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Trainer_TenantId_CreatedAt",
                schema: "gym",
                table: "Trainer",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Memberships_Trainer_TrainerId",
                schema: "gym",
                table: "Memberships",
                column: "TrainerId",
                principalSchema: "gym",
                principalTable: "Trainer",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Memberships_Trainer_TrainerId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropTable(
                name: "Trainer",
                schema: "gym");

            migrationBuilder.DropIndex(
                name: "IX_Memberships_TrainerId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "Points",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "TrainerId",
                schema: "gym",
                table: "Memberships");
        }
    }
}
