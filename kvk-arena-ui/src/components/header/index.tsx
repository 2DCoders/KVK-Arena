import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent py-4 rounded-full">
      <div className="relative rounded-full mx-auto flex h-20 max-w-295 items-center justify-between overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(135deg,rgba(6,12,28,0.78),rgba(15,23,42,0.52),rgba(8,16,32,0.72))] px-6 py-2 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        
        {/* Left Menu - Desktop */}
        <nav className="relative z-10 hidden items-center gap-8 lg:flex">
          <a
            href="#"
            className="text-sm font-medium text-slate-200 transition hover:text-white"
          >
            Home
          </a>

          <div className="group relative cursor-pointer">
            <div className="flex items-center gap-1 text-sm font-medium text-slate-200 transition hover:text-white">
              Services
              <ChevronDown size={16} />
            </div>

            {/* Dropdown */}
            <div className="invisible absolute left-0 top-8 z-50 w-48 rounded-xl border border-white/14 bg-slate-950/60 p-2 opacity-0 shadow-[0_18px_35px_rgba(2,6,23,0.35)] backdrop-blur-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                Gym
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                Badminton Courts
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                Gaming Center
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                Car Wash
              </a>
            </div>
          </div>

          <a
            href="#"
            className="text-sm font-medium text-slate-200 transition hover:text-white"
          >
            About
          </a>

          <a
            href="#"
            className="text-sm font-medium text-slate-200 transition hover:text-white"
          >
            Contact
          </a>
        </nav>

        {/* Logo */}
        <div className="absolute left-1/2 z-10 -translate-x-1/2">
          <img
            src={logo}
            alt="KVK Arena"
            className="h-10 w-auto object-contain lg:h-12 cursor-pointer"
          />
        </div>

        {/* Right Button - Desktop */}
        <div className="relative z-10 hidden lg:block">
          <button className="cursor-pointer rounded-full border border-white/30 bg-white px-7 py-2.5 text-sm font-extrabold tracking-[0.08em] text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.14)] transition hover:bg-slate-100 hover:text-[#111827]">
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="relative z-10 ml-auto rounded-lg p-2 text-slate-100 transition hover:bg-white/10 lg:hidden"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen
            ? "visible bg-slate-950/55 backdrop-blur-[2px] opacity-100"
            : "invisible opacity-0"
        }`}
      >
        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-70 border-l border-white/12 bg-[linear-gradient(180deg,rgba(8,16,32,0.88),rgba(15,23,42,0.7))] p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Top */}
          <div className="mb-8 flex items-center justify-between">
            <img
              src={logo}
              alt="KVK Arena"
              className="h-10 object-contain cursor-pointer"
            />

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer rounded-lg p-2 text-slate-100 transition hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              className="text-[15px] font-medium text-slate-100 transition hover:text-white"
            >
              Home
            </a>

            <div>
              <div className="mb-3 flex items-center justify-between text-[15px] font-medium text-slate-100">
                Services
                <ChevronDown size={18} />
              </div>

              <div className="ml-3 flex flex-col gap-3 border-l border-white/14 pl-4">
                <a href="#" className="text-sm text-slate-300 transition hover:text-white">
                  Gym Membership
                </a>
                <a href="#" className="text-sm text-slate-300 transition hover:text-white">
                  Court Booking
                </a>
                <a href="#" className="text-sm text-slate-300 transition hover:text-white">
                  Gaming Center
                </a>
                <a href="#" className="text-sm text-slate-300 transition hover:text-white">
                  Car Wash
                </a>
              </div>
            </div>

            <a
              href="#"
              className="text-[15px] font-medium text-slate-100 transition hover:text-white"
            >
              About
            </a>

            <a
              href="#"
              className="text-[15px] font-medium text-slate-100 transition hover:text-white"
            >
              Contact
            </a>

            {/* Mobile Sign In */}
            <button className="mt-6 cursor-pointer rounded-xl border border-white/30 bg-white px-5 py-3 text-sm font-extrabold tracking-[0.06em] text-slate-950 transition hover:bg-slate-100">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}