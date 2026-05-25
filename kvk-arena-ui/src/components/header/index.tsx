import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent py-4">
      <div className="mx-auto flex h-20 max-w-295 items-center justify-between rounded-full border border-white/20 bg-white/14 px-6 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-2xl lg:px-8">
        
        {/* Left Menu - Desktop */}
        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#"
            className="text-sm font-medium text-white transition hover:text-[#B8D5FF]"
          >
            Home
          </a>

          <div className="group relative cursor-pointer">
            <div className="flex items-center gap-1 text-sm font-medium text-white transition hover:text-[#B8D5FF]">
              Services
              <ChevronDown size={16} />
            </div>

            {/* Dropdown */}
            <div className="invisible absolute left-0 top-8 z-50 w-48 rounded-xl border border-white/25 bg-white/20 p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.16)] backdrop-blur-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-white transition hover:bg-white/18"
              >
                Gym
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-white transition hover:bg-white/18"
              >
                Badminton Courts
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-white transition hover:bg-white/18"
              >
                Gaming Center
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm text-white transition hover:bg-white/18"
              >
                Car Wash
              </a>
            </div>
          </div>

          <a
            href="#"
            className="text-sm font-medium text-white transition hover:text-[#B8D5FF]"
          >
            About
          </a>

          <a
            href="#"
            className="text-sm font-medium text-white transition hover:text-[#B8D5FF]"
          >
            Contact
          </a>
        </nav>

        {/* Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img
            src={logo}
            alt="KVK Arena"
            className="h-10 w-auto object-contain lg:h-12 cursor-pointer"
          />
        </div>

        {/* Right Button - Desktop */}
        <div className="hidden lg:block">
          <button className="cursor-pointer rounded-full border border-white/25 bg-white/18 px-7 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/40 hover:bg-white/28 hover:text-[#F4F8FF]">
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="ml-auto rounded-lg p-2 text-white transition hover:bg-white/20 lg:hidden"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen
            ? "visible bg-slate-950/30 backdrop-blur-[2px] opacity-100"
            : "invisible opacity-0"
        }`}
      >
        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-70 border-l border-white/25 bg-white/20 p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
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
              className="cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/25"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              className="text-[15px] font-medium text-white transition hover:text-[#B8D5FF]"
            >
              Home
            </a>

            <div>
              <div className="mb-3 flex items-center justify-between text-[15px] font-medium text-white">
                Services
                <ChevronDown size={18} />
              </div>

              <div className="ml-3 flex flex-col gap-3 border-l border-white/25 pl-4">
                <a href="#" className="text-sm text-slate-200 transition hover:text-white">
                  Gym Membership
                </a>
                <a href="#" className="text-sm text-slate-200 transition hover:text-white">
                  Court Booking
                </a>
                <a href="#" className="text-sm text-slate-200 transition hover:text-white">
                  Gaming Center
                </a>
                <a href="#" className="text-sm text-slate-200 transition hover:text-white">
                  Car Wash
                </a>
              </div>
            </div>

            <a
              href="#"
              className="text-[15px] font-medium text-white transition hover:text-[#B8D5FF]"
            >
              About
            </a>

            <a
              href="#"
              className="text-[15px] font-medium text-white transition hover:text-[#B8D5FF]"
            >
              Contact
            </a>

            {/* Mobile Sign In */}
            <button className="mt-6 cursor-pointer rounded-xl border border-white/25 bg-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/40 hover:bg-white/30 hover:text-[#F4F8FF]">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}