import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent py-4">
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6 lg:px-8 rounded-full bg-white/95 border border-white/60 shadow-sm py-2">
        
        {/* Left Menu - Desktop */}
        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#"
            className="text-sm font-medium text-black transition hover:text-blue-600"
          >
            Home
          </a>

          <div className="group relative cursor-pointer">
            <div className="flex items-center gap-1 text-sm font-medium text-black transition hover:text-blue-600">
              Services
              <ChevronDown size={16} />
            </div>

            {/* Dropdown */}
            <div className="invisible absolute left-0 top-8 z-50 w-48 rounded-xl border border-white/60 bg-white/85 p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              >
                Gym
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              >
                Badminton Courts
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              >
                Gaming Center
              </a>
              <a
                href="#"
                className="block rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              >
                Car Wash
              </a>
            </div>
          </div>

          <a
            href="#"
            className="text-sm font-medium text-black transition hover:text-blue-600"
          >
            About
          </a>

          <a
            href="#"
            className="text-sm font-medium text-black transition hover:text-blue-600"
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
          <button className="rounded-full border border-gray-300 px-7 py-2.5 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600 cursor-pointer">
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="ml-auto rounded-lg p-2 text-black transition hover:bg-gray-100 lg:hidden"
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
          className={`absolute right-0 top-0 h-full w-[280px] border-l border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
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
              className="rounded-lg p-2 hover:bg-gray-100 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              className="text-[15px] font-medium text-gray-800 transition hover:text-blue-600"
            >
              Home
            </a>

            <div>
              <div className="mb-3 flex items-center justify-between text-[15px] font-medium text-gray-800">
                Services
                <ChevronDown size={18} />
              </div>

              <div className="ml-3 flex flex-col gap-3 border-l border-gray-200 pl-4">
                <a href="#" className="text-sm text-gray-600">
                  Gym Membership
                </a>
                <a href="#" className="text-sm text-gray-600">
                  Court Booking
                </a>
                <a href="#" className="text-sm text-gray-600">
                  Gaming Center
                </a>
                <a href="#" className="text-sm text-gray-600">
                  Car Wash
                </a>
              </div>
            </div>

            <a
              href="#"
              className="text-[15px] font-medium text-gray-800 transition hover:text-blue-600"
            >
              About
            </a>

            <a
              href="#"
              className="text-[15px] font-medium text-gray-800 transition hover:text-blue-600"
            >
              Contact
            </a>

            {/* Mobile Sign In */}
            <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}