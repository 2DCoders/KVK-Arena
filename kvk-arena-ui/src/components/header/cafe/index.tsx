import logo from "@/assets/carwash_logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import SignupModal from "@/components/signup/gym";

export default function CafeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isOpenSignup, setIsOpenSignup] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const navigate = useNavigate();

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
        setShowHeader(false);
      } else if (scrollDifference < -6) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    updateHeader();

    window.addEventListener("scroll", onScroll, { passive: true });

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
      <header
        className={`fixed left-0 top-0 z-50 w-full bg-transparent py-2 transition-all duration-300 ease-out lg:py-4 ${
          showHeader
            ? "translate-y-0 opacity-100"
            : "-translate-y-[120%] pointer-events-none opacity-0"
        }`}
      >
        <div
          className={
            isScrolled
              ? "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-[#31708E]/40 bg-[linear-gradient(135deg,#180B05_0%,#3A1B0E_30%,#6A391D_65%,#D09A60_100%)] px-4 py-1.5 shadow-lg backdrop-blur-md transition-all duration-500 lg:h-20 lg:px-8 lg:py-2"
              : "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-white/30 bg-[linear-gradient(135deg,#180B05_0%,#3A1B0E_30%,#6A391D_65%,#D09A60_100%)] shadow-[0_18px_50px_rgba(25,10,3,0.22)] backdrop-blur-2xl px-4 py-1.5 backdrop-blur-2xl transition-all duration-500 lg:h-20 lg:px-8 lg:py-2"
          }
        >
          {/* Glow */}
          <div
            className={
              isScrolled
                ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,112,142,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_35%)]"
                : "pointer-events-none absolute inset-0 "
            }
          />

          {/* Left navigation */}
          <nav className="relative z-10 hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full px-4 py-2 cursor-pointer text-sm font-medium text-slate-200 transition hover:bg-[#31708E]/20 hover:text-white"
            >
              Main Arena
            </button>

            <a
              href="#about"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#31708E]/20 hover:text-white"
            >
              About
            </a>

            <a
              href="#menu"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#31708E]/20 hover:text-white"
            >
              Menu
            </a>
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 z-10 flex max-w-[180px] -translate-x-1/2 items-center gap-2 sm:max-w-none">
            <a href="#" aria-label="Auto Care home">
              <img
                src={logo}
                alt="Cafe Logo"
                className="h-8 w-auto cursor-pointer object-contain lg:h-12"
              />
            </a>

            <a href="#">
              <span className="cursor-pointer truncate text-xs font-black tracking-wide text-white sm:text-sm lg:text-xl">
                Cafe Bii
              </span>
            </a>
          </div>

          {/* Explore button */}
          <div className="relative z-10 hidden lg:block">
            <a href="#visit" className="text-slate-900">
              <button
                type="button"
                className="cursor-pointer rounded-full border border-white/30 bg-white px-7 py-2.5 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Visit Us
              </button>
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
            className="relative z-10 ml-auto rounded-xl p-2 text-white transition hover:bg-white/10 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>
      </header>

      <SignupModal
        open={isOpenSignup}
        onClose={() => setIsOpenSignup(false)}
      />

      {/* Mobile sidebar */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[9999] transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "visible bg-black/50 opacity-100 backdrop-blur-sm"
            : "invisible opacity-0"
        }`}
      >
        <aside
          onClick={(event) => event.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-72 border-l border-[#31708E]/25 bg-[linear-gradient(180deg,#000000_0%,#0B0B0B_45%,#111111_75%,#1A2429_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Glow border */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          {/* Top */}
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="flex max-w-[180px] items-center gap-2 sm:max-w-none"
            >
              <img
                src={logo}
                alt="Cafe Logo"
                className="h-10 cursor-pointer object-contain brightness-0 invert opacity-90"
              />

              <span className="truncate text-xs font-black tracking-wide text-white sm:text-sm lg:text-xl">
                Cafe Bii
              </span>
            </a>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Links */}
          <nav className="relative z-10 flex flex-col gap-5">
            <button
              type="button"
              onClick={() => {
                navigate("/");
                closeMobileMenu();
              }}
              className="rounded-xl px-3 py-2 text-left text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:pl-4 hover:text-white"
            >
              Main Arena
            </button>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:pl-4 hover:text-white"
            >
              About
            </a>

            <a
              href="#menu"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:pl-4 hover:text-white"
            >
              Menu
            </a>

            <a
              href="#visit"
              onClick={closeMobileMenu}
              className="mt-6 flex w-fit cursor-pointer items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-[#2158bc] hover:text-white hover:shadow-[0_16px_36px_rgba(41,107,225,0.35)]"
            >
              Visit Us
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}