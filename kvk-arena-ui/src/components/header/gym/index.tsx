import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/gym_logo.png";

export default function GymHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((current) => !current);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-9999 w-full rounded-full bg-transparent py-2 lg:py-4">
      <div className={isScrolled
        ? "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-white/30 bg-white/30 px-4 py-1.5 shadow-lg backdrop-blur-md lg:h-20 lg:px-8 lg:py-2"
        : "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-white/14 bg-[linear-gradient(135deg,rgba(6,12,28,0.78),rgba(15,23,42,0.52),rgba(8,16,32,0.72))] px-4 py-1.5 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:h-20 lg:px-8 lg:py-2"
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
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${isScrolled ? 'text-slate-700 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'}`}
          >
            Home
          </a>

          <a
            href="#services"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${isScrolled ? 'text-slate-700 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'}`}
          >
            Services
          </a>

          <a
            href="#about"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${isScrolled ? 'text-slate-700 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'}`}
          >
            About
          </a>

          <a
            href="#contact"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${isScrolled ? 'text-slate-700 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'}`}
          >
            Contact
          </a>
        </nav>

        {/* Logo */}
        <div className="absolute left-1/2 z-10 -translate-x-1/2">
          <a href="#">
            <img
              src={logo}
              alt="KVK Arena"
              className="h-8 w-auto cursor-pointer object-contain lg:h-12"
            />
          </a>
        </div>

        {/* Right Button - Desktop */}
        <div className="relative z-10 hidden lg:block">
          <button className={`cursor-pointer rounded-full px-7 py-2.5 text-sm font-extrabold tracking-[0.08em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] ${isScrolled ? 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-sky-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'border border-white/30 bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.14)] hover:border-sky-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950'}`}>
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={`relative z-10 ml-auto rounded-xl p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.16)] lg:hidden ${isScrolled ? 'text-slate-700 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950' : 'text-slate-100 hover:bg-white/10 hover:text-white'}`}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-9999 transition-all duration-300 ${mobileMenuOpen
          ? "visible bg-black/40 backdrop-blur-[2px] opacity-100"
          : "invisible opacity-0"
          }`}
      >
        {/* Sidebar */}
        <div
          onClick={(event) => event.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-70 border-l border-white/12 bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
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
              onClick={closeMobileMenu}
              className="cursor-pointer rounded-lg p-2 text-slate-700 transition-all duration-300 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Home
            </a>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Services
            </a>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              About
            </a>

            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Contact
            </a>

            {/* Mobile Sign In */}
            <button
              onClick={closeMobileMenu}
              className="mt-6 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold tracking-[0.06em] text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950 hover:shadow-[0_16px_36px_rgba(37,99,235,0.16)]"
            >
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}