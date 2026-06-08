using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Update_Trainer_Soft_Del : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Memberships_Trainer_TrainerId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Trainer",
                schema: "gym",
                table: "Trainer");

            migrationBuilder.RenameTable(
                name: "Trainer",
                schema: "gym",
                newName: "Trainers",
                newSchema: "gym");

            migrationBuilder.RenameIndex(
                name: "IX_Trainer_Email",
                schema: "gym",
                table: "Trainers",
                newName: "IX_Trainers_Email");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                schema: "gym",
                table: "Trainers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "gym",
                table: "Trainers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Trainers",
                schema: "gym",
                table: "Trainers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Memberships_Trainers_TrainerId",
                schema: "gym",
                table: "Memberships",
                column: "TrainerId",
                principalSchema: "gym",
                principalTable: "Trainers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Memberships_Trainers_TrainerId",
                schema: "gym",
                table: "Memberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Trainers",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "gym",
                table: "Trainers");

            migrationBuilder.RenameTable(
                name: "Trainers",
                schema: "gym",
                newName: "Trainer",
                newSchema: "gym");

            migrationBuilder.RenameIndex(
                name: "IX_Trainers_Email",
                schema: "gym",
                table: "Trainer",
                newName: "IX_Trainer_Email");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Trainer",
                schema: "gym",
                table: "Trainer",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Memberships_Trainer_TrainerId",
                schema: "gym",
                table: "Memberships",
                column: "TrainerId",
                principalSchema: "gym",
                principalTable: "Trainer",
                principalColumn: "Id");
        }
    }
}
