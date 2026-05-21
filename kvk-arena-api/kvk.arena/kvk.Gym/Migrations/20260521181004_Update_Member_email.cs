using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kvk.Gym.Migrations
{
    /// <inheritdoc />
    public partial class Update_Member_email : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Memberships_Email",
                schema: "gym",
                table: "Memberships",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Memberships_Email",
                schema: "gym",
                table: "Memberships");
        }
    }
}
