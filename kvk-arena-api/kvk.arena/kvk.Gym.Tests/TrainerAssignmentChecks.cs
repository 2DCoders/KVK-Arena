using kvk.Gym;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Services;
using Microsoft.EntityFrameworkCore;

internal static class TrainerAssignmentChecks
{
    public static async Task Run(GymDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var suffix = Guid.NewGuid().ToString("N");
            var member = new Membership
            {
                FirstName = "Assignment", LastName = "Test", UserName = suffix, Email = suffix + "@example.test",
                PasswordHash = "unused", Status = "Active", MembershipNumber = "GYM-MEM-" + suffix,
                DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 1, 1), DateTimeKind.Utc), MemberType = MemberType.Client
            };
            var first = Trainer("First", suffix);
            var second = Trainer("Second", suffix);
            db.AddRange(member, first, second);
            await db.SaveChangesAsync();
            var firstMembership = TrainerMembership(first);
            var secondMembership = TrainerMembership(second);
            db.AddRange(firstMembership, secondMembership);
            await db.SaveChangesAsync();
            var service = new MembershipService(db, null!, null!, null!);

            Assert((await service.AssignTrainerAsync(member.Id, first.Id)).Succeeded, "Assign a trainer using the existing service");
            db.ChangeTracker.Clear();
            var list = await service.GetAllMembersAsync();
            var result = list.Single(m => m.Id == member.Id);
            Assert(result.TrainerId == first.Id && result.AssignedTrainer == "First Trainer",
                "Admin member list exposes the assigned trainer ID and name");
            var details = await service.GetMemberAsync(member.Id);
            Assert(details.TrainerId == first.Id && details.AssignedTrainer == "First Trainer",
                "Member details agree with the list assignment");
            Assert((await service.AssignTrainerAsync(member.Id, second.Id)).Succeeded, "Reassign the member to another trainer");
            db.ChangeTracker.Clear();
            list = await service.GetAllMembersAsync();
            Assert(list.Count(m => m.Id == member.Id && m.TrainerId == second.Id) == 1
                && !list.Any(m => m.Id == member.Id && m.TrainerId == first.Id),
                "Reassignment moves the member between trainer rosters; exactly one trainer remains");
            Assert((await service.AssignTrainerAsync(member.Id, second.Id)).Succeeded, "Assigning the same trainer is safe to repeat");
            Assert(!(await service.AssignTrainerAsync(member.Id, Guid.NewGuid())).Succeeded, "Missing trainers cannot be assigned");
            Assert(!(await service.AssignTrainerAsync(Guid.NewGuid(), second.Id)).Succeeded, "Missing members cannot be assigned");
            Assert(!(await service.AssignTrainerAsync(member.Id, Guid.Empty)).Succeeded, "Empty trainer selection is rejected");

            secondMembership = (await db.Memberships.FindAsync(second.Id))!;
            foreach (var status in new[] { MembershipStatus.Inactive, MembershipStatus.Blocked, MembershipStatus.Suspended })
            {
                secondMembership.MembershipStatus = status;
                await db.SaveChangesAsync();
                var options = await service.GetAllTrainersAsync();
                Assert(options.Single(t => t.Id == second.Id).MembershipStatus == status.ToString(),
                    $"{status} trainers remain visible with their membership status");
                var rejected = await service.AssignTrainerAsync(member.Id, second.Id);
                Assert(!rejected.Succeeded && rejected.Message.Contains(status.ToString(), StringComparison.OrdinalIgnoreCase),
                    $"{status} trainer assignment is rejected with a clear reason");
            }
            secondMembership.MembershipStatus = MembershipStatus.Active;
            await db.SaveChangesAsync();
            Assert((await service.AssignTrainerAsync(member.Id, second.Id)).Succeeded, "Reactivated trainers can be assigned again");

            second = (await db.Trainers.FindAsync(second.Id))!;
            second.IsDeleted = true;
            await db.SaveChangesAsync();
            Assert(!(await service.AssignTrainerAsync(member.Id, second.Id)).Succeeded, "Deleted trainers cannot be assigned");
            member = (await db.Memberships.FindAsync(member.Id))!;
            member.IsDeleted = true;
            await db.SaveChangesAsync();
            Assert(!(await service.AssignTrainerAsync(member.Id, first.Id)).Succeeded, "Deleted members cannot receive a trainer");
            member.IsDeleted = false;
            member.MemberType = MemberType.Trainer;
            await db.SaveChangesAsync();
            Assert(!(await service.AssignTrainerAsync(member.Id, first.Id)).Succeeded, "Only client memberships receive trainers");
            Assert(member.TrainerId == second.Id, "Rejected assignments preserve the existing trainer");
            Console.WriteLine("Trainer assignment regression checks passed.");
        }
        finally { await transaction.RollbackAsync(); }
    }

    private static Trainer Trainer(string name, string suffix) => new()
    {
        FirstName = name, LastName = "Trainer", UserName = name + suffix, Email = name + suffix + "@example.test",
        PasswordHash = "unused", Status = "Active",
        DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 1, 1), DateTimeKind.Utc)
    };

    private static Membership TrainerMembership(Trainer trainer) => new()
    {
        Id = trainer.Id, FirstName = trainer.FirstName, LastName = trainer.LastName,
        UserName = trainer.UserName, Email = trainer.Email, PasswordHash = "unused", Status = "Active",
        DateOfBirth = trainer.DateOfBirth, MembershipNumber = "GYM-TRA-" + trainer.Id.ToString("N"),
        MemberType = MemberType.Trainer, MembershipStatus = MembershipStatus.Active
    };

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
        Console.WriteLine("PASS: " + message);
    }
}
