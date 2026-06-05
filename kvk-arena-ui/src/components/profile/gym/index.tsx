import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Trophy,
  Dumbbell,
  Flame,
  Clock3,
  User,
} from "lucide-react";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  open,
  onClose,
}: UserProfileModalProps) {
  if (!open) return null;

  const stats = [
    {
      title: "Gym Visits",
      value: "186",
      icon: Dumbbell,
    },
    {
      title: "Calories Burned",
      value: "48K",
      icon: Flame,
    },
    {
      title: "Workout Hours",
      value: "372",
      icon: Clock3,
    },
    {
      title: "Reward Points",
      value: "2,450",
      icon: Trophy,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-screen overflow-y-auto">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 min-h-[350px]">
          {/* Background Glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-blue-600/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-blue-500/10 blur-[120px]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* User Info */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                  <Crown size={16} className="text-blue-300" />
                  <span className="text-sm font-medium text-blue-200">
                    Platinum Membership
                  </span>
                </div>

                <h1 className="mt-5 text-4xl md:text-6xl font-bold text-white">
                  John Anderson
                </h1>

                <p className="mt-3 max-w-xl text-slate-300">
                  Dedicated fitness enthusiast focused on strength training,
                  endurance, and maintaining a healthy lifestyle.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    Member Since Jan 2025
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    Colombo, Sri Lanka
                  </div>
                </div>
              </div>

              {/* Membership Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 min-w-[220px]">
                  <p className="text-sm text-slate-300">
                    Membership Plan
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-white">
                    Platinum
                  </h3>

                  <span className="mt-3 inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
                    Active Membership
                  </span>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 min-w-[220px]">
                  <p className="text-sm text-slate-300">
                    Reward Points
                  </p>

                  <h3 className="mt-3 text-4xl font-bold text-white">
                    2,450
                  </h3>

                  <p className="mt-3 text-xs text-blue-300">
                    💡 1 Point = Rs. 1.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-100 min-h-[calc(100vh-350px)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact */}
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-5">
                    Contact Information
                  </h3>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <Mail className="text-blue-600" size={18} />
                      </div>
                      <span className="text-slate-700">
                        john@email.com
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <Phone className="text-blue-600" size={18} />
                      </div>
                      <span className="text-slate-700">
                        +94 77 123 4567
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <MapPin className="text-blue-600" size={18} />
                      </div>
                      <span className="text-slate-700">
                        Colombo, Sri Lanka
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trainer */}
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-5">
                    Personal Trainer
                  </h3>

                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 flex items-center justify-center">
                      <User className="text-white" size={28} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg text-slate-900">
                        Michael Perera
                      </h4>

                      <p className="text-slate-500 text-sm">
                        Certified Fitness Trainer
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-slate-600">
                    <div className="flex items-center gap-3">
                      <Phone size={18} />
                      +94 71 456 7890
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail size={18} />
                      trainer@gym.com
                    </div>
                  </div>

                  <button className="mt-6 w-full rounded-2xl bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700">
                    Contact Trainer
                  </button>
                </div>

                {/* Benefits */}
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-5">
                    Membership Benefits
                  </h3>

                  <div className="space-y-3">
                    {[
                      "Unlimited Gym Access",
                      "Free Sauna Access",
                      "Personal Trainer Support",
                      "Nutrition Consultation",
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="rounded-2xl bg-slate-50 p-4 text-slate-700"
                      >
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Fitness Journey
                  </h3>

                  <p className="leading-8 text-slate-600">
                    Consistently training to improve strength, endurance,
                    flexibility, and overall health. Focused on maintaining an
                    active lifestyle through structured workout programs,
                    nutrition guidance, and regular fitness tracking.
                  </p>
                </div>

                {/* Stats */}
                <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Fitness Overview
                  </h3>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white shadow-lg"
                        >
                          <Icon size={28} />

                          <h4 className="mt-5 text-3xl font-bold">
                            {item.value}
                          </h4>

                          <p className="mt-2 text-slate-300 text-sm">
                            {item.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Monthly Progress
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        title: "Workout Consistency",
                        value: "90%",
                      },
                      {
                        title: "Strength Goal",
                        value: "75%",
                      },
                      {
                        title: "Weight Loss Goal",
                        value: "65%",
                      },
                    ].map((item) => (
                      <div key={item.title}>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-slate-700">
                            {item.title}
                          </span>

                          <span className="font-semibold text-blue-600">
                            {item.value}
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                            style={{ width: item.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}