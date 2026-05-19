namespace kvk.Gym.Enums;

public enum MembershipType
{
    Monthly = 1,
    Quarterly = 2,
    Annual = 3,
    DayPass = 4
}


public enum MembershipStatus
{
    Active = 1,
    Inactive = 2,
    Cancelled = 3,
    Suspended = 4
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Overdue = 3,
    Completed = 4,
    Cancelled = 5
}


public enum PaymentType
{
    Cash = 1,
    CreditCard = 2,
    PayPal = 3
}



public enum Gender
{
    Male = 1,
    Female = 2
}

public enum MemberType
{
    Client = 1,
    Trainer = 2,
    Staff = 3
}