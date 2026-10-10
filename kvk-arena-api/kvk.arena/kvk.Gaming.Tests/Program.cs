using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.Game;
using kvk.Gaming.Persistence.DesignTime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Exercise controller routing and persisted deletion. Roll back every test record.
await using var db = new GamingDesignTimeDbContextFactory().CreateDbContext([]);
await using var transaction = await db.Database.BeginTransactionAsync();
try
{
    var controller = new GameController(new GameService(db));
    foreach (var active in new[] { true, false })
    {
        var game = new kvk.Gaming.Domain.Game
        {
            Id = Guid.NewGuid(), Name = "Delete regression " + Guid.NewGuid(), IsActive = active
        };
        db.Games.Add(game);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var response = await controller.Delete(game.Id);
        Assert(response is OkObjectResult { Value: Result { Succeeded: true, Message: "Game deleted successfully." } },
            $"DELETE succeeds for an {(active ? "active" : "inactive")} game");
        db.ChangeTracker.Clear();
        Assert(!await db.Games.AnyAsync(g => g.Id == game.Id), "Game is removed from the database");
    }

    Assert(await controller.Delete(Guid.Empty) is BadRequestObjectResult, "Empty IDs are rejected");
    Assert(await controller.Delete(Guid.NewGuid()) is BadRequestObjectResult, "Missing games are rejected");
    Console.WriteLine("Game deletion regression checks passed.");
}
finally
{
    await transaction.RollbackAsync();
}

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
    Console.WriteLine("PASS: " + message);
}
