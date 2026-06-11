import logo from "@/assets/badminton_logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import SignupModal from "@/components/signup/gym";

export default function BadmintonHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpenSignup, setIsOpenSignup] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((current) => !current);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 w-full rounded-full bg-transparent py-2 lg:py-4">
      <div
        className={
          isScrolled
            ? "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-black/30 bg-black/60 px-4 py-1.5 shadow-lg backdrop-blur-md lg:h-20 lg:px-8 lg:py-2"
            : "relative mx-auto flex h-16 max-w-295 items-center justify-between overflow-hidden rounded-full border border-white/30 bg-[linear-gradient(135deg,rgba(0,0,0,0),rgba(92,45,20,0.75),rgba(180,95,40,0.55))] px-4 py-1.5 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-2xl lg:h-20 lg:px-8 lg:py-2"
        }
      >
        {/* glow */}
        <div
          className={
            isScrolled
              ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_30%)]"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]"
          }
        />

        {/* LEFT NAV */}
        <nav className="relative z-10 hidden items-center gap-8 lg:flex">
          <a
            href="#"
            onClick={() => navigate("/")}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Main Arena
          </a>

          <a
            href="#courts"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Courts
          </a>

          <a
            href="#services"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Services
          </a>
        </nav>

        {/* LOGO */}
        <div className="absolute left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 max-w-[180px] sm:max-w-none">
          <a href="#">
            <img
              src={logo}
              alt="Badminton"
              className="h-8 w-auto lg:h-12 cursor-pointer object-contain"
            />
          </a>

          <a href="#">
            <span className="text-white cursor-pointer font-black text-xs sm:text-sm lg:text-xl tracking-wide truncate">
              BADMINTON
            </span>
          </a>
        </div>

        {/* JOIN BUTTON */}
        <div className="relative z-10 hidden lg:block">
          <a href="#bookings" className="text-slate-900">
            <button className="rounded-full cursor-pointer border border-white/30 bg-white px-7 py-2.5 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg">
              Book Now
            </button>
          </a>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={toggleMobileMenu}
          className="relative z-10 ml-auto rounded-xl p-2 text-white lg:hidden"
        >
          <Menu size={18} />
        </button>
      </div>

      <SignupModal open={isOpenSignup} onClose={() => setIsOpenSignup(false)} />

      {/* ================= MOBILE SIDEBAR (DARK PREMIUM) ================= */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen
            ? "visible bg-black/50 opacity-100"
            : "invisible opacity-0"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-72 border-l border-white/10
                        bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
                        p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl
                        transition-transform duration-300 ${
                          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
        >
          {/* glow border */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          {/* TOP */}
          <div className="mb-8 flex items-center justify-between">
            <div className=" z-10 flex items-center gap-2 max-w-[180px] sm:max-w-none">
              <img
                src={logo}
                alt="Gym"
                className="h-10 cursor-pointer object-contain brightness-0 invert opacity-90"
              />

              <span className="text-white font-black text-xs sm:text-sm lg:text-xl tracking-wide truncate">
                BADMINTON
              </span>
            </div>

            <button
              onClick={closeMobileMenu}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* LINKS */}
          <nav className="flex flex-col gap-5">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white hover:pl-4"
            >
              Main Arena
            </a>

            <a
              href="#courts"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white hover:pl-4"
            >
              Courts
            </a>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className="rounded-xl px-3 py-2 text-[15px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white hover:pl-4"
            >
              Services
            </a>

            {/* JOIN BUTTON */}
            <a href="#bookings">
              <button
              onClick={() => {
                  closeMobileMenu();
                }}
                className="mt-6 cursor-pointer rounded-xl bg-[#296BE1] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2158bc] hover:shadow-[0_16px_36px_rgba(41,107,225,0.35)]"
              >
                Book Now
              </button>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
