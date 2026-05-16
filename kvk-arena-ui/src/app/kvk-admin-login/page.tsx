"use client";

import Link from "next/link";
import {
  FiEye,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiShield,
  FiHeart,
} from "react-icons/fi";

export default function AdminLoginPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f5]">
      <div className="grid h-screen grid-cols-1 overflow-hidden lg:grid-cols-[480px_1fr]">
        {/* LEFT PANEL */}
        <div className="relative hidden h-screen overflow-hidden bg-[#2f64ea] lg:flex flex-col">
          {/* Decorative Circles */}
          <div className="absolute -left-28 -top-28 h-[340px] w-[340px] rounded-full bg-white/5" />
          <div className="absolute bottom-[90px] right-[-90px] h-[340px] w-[340px] rounded-full bg-white/5" />
          <div className="absolute bottom-[-140px] left-[110px] h-[240px] w-[240px] rounded-full bg-white/5" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Top Section */}
            <div className="px-14 pt-12">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <FiHeart className="text-[22px] text-white" />
                </div>

                <div>
                  <h2 className="text-[18px] font-semibold leading-none text-white">
                    KVK Arena
                  </h2>

                  <p className="mt-1 text-[14px] text-white/70">
                    Admin Panel
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mt-14">
                <h1 className="max-w-[360px] text-[42px] font-bold leading-[1.18] tracking-[-1.5px] text-white">
                  KVK Arena
                  <br />
                  Management,
                  <br />
                  Simplified.
                </h1>

                <p className="mt-6 max-w-[400px] text-[15px] leading-[1.7] text-white/75">
                  A unified platform for managing KVK Arena services, bookings, and members.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-10 h-px w-full bg-white/20" />

            {/* Features */}
            <div className="px-14 pt-8">
              <div className="space-y-5">
                <FeatureItem
                  icon={<FiUsers />}
                  text="Complete member record management"
                />

                <FeatureItem
                  icon={<FiCalendar />}
                  text="Smart booking and scheduling"
                />

                <FeatureItem
                  icon={<FiDollarSign />}
                  text="Billing & invoice automation"
                />

                <FeatureItem
                  icon={<FiShield />}
                  text="Role-based access & security"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto px-14 pb-10">
              <p className="text-[13px] text-white/45">
                © 2026 KVK Arena. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex h-screen items-center justify-center overflow-hidden px-6 py-6">
          <div className="w-full max-w-[430px]">
            {/* Login Card */}
            <div className="rounded-[24px] border border-[#ececec] bg-white px-9 py-9 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
              <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[#1e293b]">
                Welcome back
              </h2>

              <p className="mt-2 text-[15px] text-[#94a3b8]">
                Sign in to access your KVK Arena admin dashboard
              </p>

              {/* FORM */}
              <form className="mt-8">
                {/* Email */}
                <div>
                  <label className="block text-[15px] font-semibold text-[#0f172a]">
                    Email address
                  </label>

                  <input
                    type="email"
                    placeholder="admin@kvkarena.com"
                    className="mt-3 h-[52px] w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 text-[15px] text-[#334155] outline-none transition focus:border-[#2f64ea] focus:ring-4 focus:ring-[#2f64ea]/10"
                  />
                </div>

                {/* Password */}
                <div className="mt-6">
                  <label className="block text-[15px] font-semibold text-[#0f172a]">
                    Password
                  </label>

                  <div className="relative mt-3">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="h-[52px] w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 pr-12 text-[15px] text-[#334155] outline-none transition focus:border-[#2f64ea] focus:ring-4 focus:ring-[#2f64ea]/10"
                    />

                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-[#64748b]"
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="mt-5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[14px] text-[#64748b]">
                    <input
                      type="checkbox"
                      className="h-[16px] w-[16px] rounded border-[#cbd5e1]"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-[14px] font-medium text-[#2f64ea] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In */}
                <button className="mt-6 flex h-[46px] w-full items-center justify-center rounded-xl bg-[#2f64ea] text-[15px] font-semibold text-white transition hover:bg-[#2457d9]">
                  Sign in
                </button>
              </form>
            </div>

            {/* Register */}
            <p className="mt-6 text-center text-[15px] text-[#64748b]">
              New to the system?{" "}
              <Link
                href="#"
                className="font-medium text-[#2f64ea] hover:underline"
              >
                Register your facility
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-white/10 text-[16px] text-white backdrop-blur-sm">
        {icon}
      </div>

      <span className="text-[15px] font-medium text-white/95">
        {text}
      </span>
    </div>
  );
}