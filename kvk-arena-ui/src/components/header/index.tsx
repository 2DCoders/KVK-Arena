import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo1.png";
import ConstructionModal from "../404";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [open404, setOpen404] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleMobileMenu = () =>
    setMobileMenuOpen((current) => !current);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDifference = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > 600);

      if (mobileMenuOpen) {
        setShowHeader(true);
      } else if (currentScrollY <= 80) {
        setShowHeader(true);
      } else if (scrollDifference > 6) {
        // Hide while scrolling down
        setShowHeader(false);
      } else if (scrollDifference < -6) {
        // Show while scrolling up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;

      window.requestAnimationFrame(updateHeader);
      ticking.current = true;
    };

    updateHeader();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    if (mobileMenuOpen) {
      setShowHeader(true);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <ConstructionModal
        open={open404}
        onClose={() => setOpen404(false)}
        pageName="Services Section"
      />

      <header
        className={`fixed left-0 top-0 z-[9999] w-full bg-transparent py-2 transition-all duration-300 ease-out lg:py-4 ${
          showHeader
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-[120%] opacity-0"
        }`}
      >
        <div
          className={
            isScrolled
              ? "relative mx-auto flex h-16 max-w-[1180px] items-center justify-between overflow-hidden rounded-full border border-white/30 bg-white/30 px-4 py-1.5 shadow-lg backdrop-blur-md transition-all duration-500 lg:h-20 lg:px-8 lg:py-2"
              : "relative mx-auto flex h-16 max-w-[1180px] items-center justify-between overflow-hidden rounded-full border border-white/30 bg-[linear-gradient(135deg,rgba(6,12,28,0.78),rgba(15,23,42,0.52),rgba(8,16,32,0.72))] px-4 py-1.5 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-2xl transition-all duration-500 lg:h-20 lg:px-8 lg:py-2"
          }
        >
          {!isScrolled ? (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
          )}

          {/* Left menu - desktop */}
          <nav className="relative z-10 hidden items-center gap-8 lg:flex">
            <a
              href="#"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${
                isScrolled
                  ? "text-slate-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
                  : "text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm"
              }`}
            >
              Home
            </a>

            <a
              href="#services"
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${
                isScrolled
                  ? "text-slate-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
                  : "text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm"
              }`}
            >
              Services
            </a>

            <a
              href="#about"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)] ${
                isScrolled
                  ? "text-slate-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
                  : "text-slate-200 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm"
              }`}
            >
              About
            </a>
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 z-10 -translate-x-1/2">
            <a href="#" aria-label="KVK Arena home">
              <img
                src={logo}
                alt="KVK Arena"
                className="h-8 w-auto cursor-pointer object-contain lg:h-12"
              />
            </a>
          </div>

          {/* Contact button - desktop */}
          <div className="relative z-10 hidden lg:block">
            <a
              href="#contact"
              className={`inline-flex cursor-pointer items-center justify-center rounded-full px-7 py-2.5 text-sm font-extrabold tracking-[0.08em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] ${
                isScrolled
                  ? "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-sky-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
                  : "border border-white/30 bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.14)] hover:border-sky-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
              }`}
            >
              Contact Us
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            className={`relative z-10 ml-auto rounded-xl p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.16)] lg:hidden ${
              isScrolled
                ? "text-slate-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
                : "text-slate-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {mobileMenuOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[10000] transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "visible bg-black/40 opacity-100 backdrop-blur-[2px]"
            : "invisible opacity-0"
        }`}
      >
        <aside
          onClick={(event) => event.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-72 overflow-hi border-l border-white/12 bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-transform duration-300 ${
            mobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          {/* Sidebar top */}
          <div className="mb-8 flex items-center justify-between">
            <a
              href="#"
              onClick={closeMobileMenu}
              aria-label="KVK Arena home"
            >
              <img
                src={logo}
                alt="KVK Arena"
                className="h-10 cursor-pointer object-contain"
              />
            </a>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="cursor-pointer rounded-lg p-2 text-slate-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile links */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Home
            </a>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className="cursor-pointer rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Services
            </a>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              About
            </a>

            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950"
            >
              Contact
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}