using System.Data;
using System.Data.Common;
using kvk.BuildingBlocks.Common;
using kvk.Gym;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.GymAnalytics;

public class GymAnalyticsService
{
    private readonly GymDbContext _db;

    public GymAnalyticsService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<GymAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        if (startDate == DateTime.MinValue || endDate == DateTime.MinValue)
             throw new ArgumentException("Invalid date range");

        if (startDate > endDate)
            throw new ArgumentException("Start date cannot be after end date");

        try
        {
            GymAnalyticsResponse? aggregated = null;

            var conn = _db.Database.GetDbConnection();
            await conn.OpenAsync(cancellationToken);
            try
            {
                // Refresh the materialized view to ensure analytics are up-to-date.
                using (var refreshCmd = conn.CreateCommand())
                {
                    refreshCmd.CommandText = @"REFRESH MATERIALIZED VIEW gym.""MemberFinancialAnalyticsDaily"";";
                    // Execute refresh (may take time depending on data size)
                    await refreshCmd.ExecuteNonQueryAsync(cancellationToken);
                }

                // Aggregate metrics across the requested date range
                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"SELECT
COALESCE(SUM(""TotalTransactions""),0) AS ""TotalTransactions"",
COALESCE(SUM(""SuccessfulTransactions""),0) AS ""SuccessfulTransactions"",
COALESCE(SUM(""PendingTransactions""),0) AS ""PendingTransactions"",
COALESCE(SUM(""OverdueTransactions""),0) AS ""OverdueTransactions"",
COALESCE(SUM(""CancelledTransactions""),0) AS ""CancelledTransactions"",

COALESCE(SUM(""TotalRevenue""),0) AS ""TotalRevenue"",
COALESCE(SUM(""PendingRevenue""),0) AS ""PendingRevenue"",
COALESCE(SUM(""OverdueRevenue""),0) AS ""OverdueRevenue"",
COALESCE(SUM(""CancelledRevenue""),0) AS ""CancelledRevenue"",

COALESCE(SUM(""CashRevenue""),0) AS ""CashRevenue"",
COALESCE(SUM(""CreditCardRevenue""),0) AS ""CreditCardRevenue"",
COALESCE(SUM(""PayPalRevenue""),0) AS ""PayPalRevenue"",

COALESCE(SUM(""NewMemberships""),0) AS ""NewMemberships"",
COALESCE(SUM(""RenewedMemberships""),0) AS ""RenewedMemberships"",
COALESCE(SUM(""ExpiredMemberships""),0) AS ""ExpiredMemberships"",

MAX(""LastRefreshAt"") AS ""LastRefreshAt""
FROM gym.""MemberFinancialAnalyticsDaily""
WHERE ""AnalyticsDate"" BETWEEN @start AND @end;";

                var p1 = cmd.CreateParameter();
                p1.ParameterName = "@start";
                p1.Value = startDate.Date;
                p1.DbType = DbType.Date;
                cmd.Parameters.Add(p1);

                var p2 = cmd.CreateParameter();
                p2.ParameterName = "@end";
                p2.Value = endDate.Date;
                p2.DbType = DbType.Date;
                cmd.Parameters.Add(p2);

                using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
                if (await reader.ReadAsync(cancellationToken))
                {
                    aggregated = new GymAnalyticsResponse
                    {
                        StartDate = startDate.Date,
                        EndDate = endDate.Date,

                        TotalTransactions = reader.IsDBNull(reader.GetOrdinal("TotalTransactions"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("TotalTransactions")),
                        SuccessfulTransactions = reader.IsDBNull(reader.GetOrdinal("SuccessfulTransactions"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("SuccessfulTransactions")),
                        PendingTransactions = reader.IsDBNull(reader.GetOrdinal("PendingTransactions"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("PendingTransactions")),
                        OverdueTransactions = reader.IsDBNull(reader.GetOrdinal("OverdueTransactions"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("OverdueTransactions")),
                        CancelledTransactions = reader.IsDBNull(reader.GetOrdinal("CancelledTransactions"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("CancelledTransactions")),

                        TotalRevenue = reader.IsDBNull(reader.GetOrdinal("TotalRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("TotalRevenue")),
                        PendingRevenue = reader.IsDBNull(reader.GetOrdinal("PendingRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("PendingRevenue")),
                        OverdueRevenue = reader.IsDBNull(reader.GetOrdinal("OverdueRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("OverdueRevenue")),
                        CancelledRevenue = reader.IsDBNull(reader.GetOrdinal("CancelledRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("CancelledRevenue")),

                        CashRevenue = reader.IsDBNull(reader.GetOrdinal("CashRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("CashRevenue")),
                        CreditCardRevenue = reader.IsDBNull(reader.GetOrdinal("CreditCardRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("CreditCardRevenue")),
                        PayPalRevenue = reader.IsDBNull(reader.GetOrdinal("PayPalRevenue"))
                            ? 0
                            : reader.GetDecimal(reader.GetOrdinal("PayPalRevenue")),

                        NewMemberships = reader.IsDBNull(reader.GetOrdinal("NewMemberships"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("NewMemberships")),
                        RenewedMemberships = reader.IsDBNull(reader.GetOrdinal("RenewedMemberships"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("RenewedMemberships")),
                        ExpiredMemberships = reader.IsDBNull(reader.GetOrdinal("ExpiredMemberships"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("ExpiredMemberships")),

                        LastRefreshAt = reader.IsDBNull(reader.GetOrdinal("LastRefreshAt"))
                            ? DateTime.MinValue
                            : reader.GetDateTime(reader.GetOrdinal("LastRefreshAt"))
                    };
                }
            }
            finally
            {
                await conn.CloseAsync();
            }

            if (aggregated == null)
                throw new Exception("Failed to fetch analytics");
                
            return aggregated;
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to fetch analytics", ex);
        }
    }
}