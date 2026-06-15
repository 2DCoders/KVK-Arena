using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Update_Trainer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFreelance",
                schema: "gym",
                table: "Trainers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePicture",
                schema: "gym",
                table: "Trainers",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "gym",
                table: "Trainers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFreelance",
                schema: "gym",
                table: "TrainerApprovalRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePicture",
                schema: "gym",
                table: "TrainerApprovalRequests",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "gym",
                table: "TrainerApprovalRequests",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFreelance",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "IsFreelance",
                schema: "gym",
                table: "TrainerApprovalRequests");

            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                schema: "gym",
                table: "TrainerApprovalRequests");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "gym",
                table: "TrainerApprovalRequests");
        }
    }
}
