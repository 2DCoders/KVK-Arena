import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent py-4 rounded-full">
      <div className={isScrolled
        ? "relative rounded-full mx-auto flex h-20 max-w-295 items-center justify-between overflow-hidden border border-white/30 bg-white/30 px-6 py-2 shadow-lg backdrop-blur-md lg:px-8"
        : "relative rounded-full mx-auto flex h-20 max-w-295 items-center justify-between overflow-hidden border border-white/14 bg-[linear-gradient(135deg,rgba(6,12,28,0.78),rgba(15,23,42,0.52),rgba(8,16,32,0.72))] px-6 py-2 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:px-8"
      }>
        {!isScrolled ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
        
        {/* Left Menu - Desktop */}
        <nav className="relative z-10 hidden items-center gap-8 lg:flex">
          <a
            href="#"
            className={`text-sm font-medium transition ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            Home
          </a>

          <div className="group relative cursor-pointer">
            <div className={`flex items-center gap-1 text-sm font-medium transition ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'}`}>
              Services
            </div>
          </div>

          <a
            href="#"
            className={`text-sm font-medium transition ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            About
          </a>

          <a
            href="#"
            className={`text-sm font-medium transition ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-200 hover:text-white'}`}
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
          <button className={`cursor-pointer rounded-full px-7 py-2.5 text-sm font-extrabold tracking-[0.08em] transition ${isScrolled ? 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50' : 'border border-white/30 bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.14)] hover:bg-slate-100'}`}>
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`relative z-10 ml-auto rounded-lg p-2 transition lg:hidden ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-100 hover:bg-white/10'}`}
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            mobileMenuOpen
              ? "visible bg-black/40 backdrop-blur-[2px] opacity-100"
              : "invisible opacity-0"
          }`}
        >
        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-70 border-l border-white/12 bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-transform duration-300 ${
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
              className="cursor-pointer rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              className="text-[15px] font-medium text-slate-800 transition hover:text-slate-900"
            >
              Home
            </a>

            <div>
              <div className="mb-3 flex items-center justify-between text-[15px] font-medium text-slate-800">
                Services
              </div>
            </div>

            <a
              href="#"
              className="text-[15px] font-medium text-slate-800 transition hover:text-slate-900"
            >
              About
            </a>

            <a
              href="#"
              className="text-[15px] font-medium text-slate-800 transition hover:text-slate-900"
            >
              Contact
            </a>

            {/* Mobile Sign In */}
            <button className="mt-6 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold tracking-[0.06em] text-slate-900 transition hover:bg-slate-50">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}