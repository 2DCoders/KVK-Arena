import logo from "@/assets/carwash_logo.png";
import SignupModal from "@/components/signup/gym";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CarwashHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] =
    useState(false);
  const [showHeader, setShowHeader] =
    useState(true);
  const [isOpenSignup, setIsOpenSignup] =
    useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const navigate = useNavigate();

  const closeMobileMenu = () =>
    setMobileMenuOpen(false);

  const toggleMobileMenu = () =>
    setMobileMenuOpen((current) => !current);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateHeader = () => {
      const currentScrollY = Math.max(
        window.scrollY,
        0,
      );

      const scrollDifference =
        currentScrollY - lastScrollY.current;

      const activationPoint =
        window.innerHeight * 4.95;

      const isDesktop =
        window.innerWidth >= 1024;

      /*
       * Change header background only after
       * the user passes 95vh.
       */
      setIsScrolled(
        currentScrollY > activationPoint,
      );

      /*
       * Always keep the header visible
       * on mobile and tablet.
       */
      if (!isDesktop) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Keep the header visible while
       * the mobile menu is open.
       */
      if (mobileMenuOpen) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Always show the header during
       * the first 95vh.
       */
      if (currentScrollY <= activationPoint) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * After 95vh:
       * scroll down = hide
       * scroll up = show
       */
      if (scrollDifference > 6) {
        setShowHeader(false);
      } else if (scrollDifference < -6) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      window.requestAnimationFrame(
        updateHeader,
      );
    };

    const onResize = () => {
      if (window.innerWidth < 1024) {
        setShowHeader(true);
      }

      updateHeader();
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      onResize,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll,
      );

      window.removeEventListener(
        "resize",
        onResize,
      );
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const previousBodyOverflow =
      document.body.style.overflow;

    const previousBodyOverflowX =
      document.body.style.overflowX;

    const previousHtmlOverflowX =
      document.documentElement.style
        .overflowX;

    document.body.style.overflow =
      mobileMenuOpen ? "hidden" : "";

    document.body.style.overflowX =
      "hidden";

    document.documentElement.style.overflowX =
      "hidden";

    if (mobileMenuOpen) {
      setShowHeader(true);
    }

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.body.style.overflowX =
        previousBodyOverflowX;

      document.documentElement.style.overflowX =
        previousHtmlOverflowX;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`
          fixed left-0 top-0 z-50 w-full
          translate-y-0 bg-transparent py-2
          opacity-100
          transition-all duration-300 ease-out
          lg:py-4
          ${
            showHeader
              ? "lg:translate-y-0 lg:opacity-100"
              : "lg:pointer-events-none lg:-translate-y-[120%] lg:opacity-0"
          }
        `}
      >
        <div
          className={
            isScrolled
              ? `
                relative mx-auto flex h-16
                w-[calc(100%-1rem)]
                max-w-[1180px]
                items-center justify-between
                overflow-hidden rounded-full
                border border-[#31708E]/40
                bg-black/75
                px-4 py-1.5
                shadow-lg backdrop-blur-md
                transition-all duration-500
                sm:w-[calc(100%-2rem)]
                lg:h-20 lg:px-8 lg:py-2
              `
              : `
                relative mx-auto flex h-16
                w-[calc(100%-1rem)]
                max-w-[1180px]
                items-center justify-between
                overflow-hidden rounded-full
                border border-white/30
                bg-[linear-gradient(135deg,#000000,#111111,#1b2f39)]
                px-4 py-1.5
                backdrop-blur-2xl
                transition-all duration-500
                sm:w-[calc(100%-2rem)]
                lg:h-20 lg:px-8 lg:py-2
              `
          }
        >
          {/* Glow */}
          <div
            className={
              isScrolled
                ? `
                  pointer-events-none
                  absolute inset-0
                  bg-[radial-gradient(circle_at_top_left,rgba(49,112,142,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_35%)]
                `
                : `
                  pointer-events-none
                  absolute inset-0
                  bg-[radial-gradient(circle_at_top_left,rgba(49,112,142,0.30),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_30%)]
                `
            }
          />

          {/* Desktop navigation */}
          <nav className="relative z-10 hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                cursor-pointer rounded-full
                px-4 py-2 text-sm
                font-medium text-slate-200
                transition
                hover:bg-[#31708E]/20
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#services"
              className="
                rounded-full px-4 py-2
                text-sm font-medium
                text-slate-200 transition
                hover:bg-[#31708E]/20
                hover:text-white
              "
            >
              Services
            </a>

            <a
              href="#pricing"
              className="
                rounded-full px-4 py-2
                text-sm font-medium
                text-slate-200 transition
                hover:bg-[#31708E]/20
                hover:text-white
              "
            >
              Pricing
            </a>
          </nav>

          {/* Logo */}
          <div
            className="
              absolute left-1/2 z-10
              flex max-w-[180px]
              -translate-x-1/2
              items-center gap-2
              sm:max-w-none
            "
          >
            <a
              href="#"
              aria-label="Auto Care home"
            >
              <img
                src={logo}
                alt="Carwash Logo"
                className="
                  h-8 w-auto cursor-pointer
                  object-contain lg:h-12
                "
              />
            </a>

            <a href="#">
              <span
                className="
                  cursor-pointer truncate
                  text-xs font-black
                  tracking-wide text-white
                  sm:text-sm lg:text-xl
                "
              >
                Auto Care
              </span>
            </a>
          </div>

          {/* Desktop package button */}
          <div className="relative z-10 hidden lg:block">
            <a
              href="#packages"
              className="text-slate-900"
            >
              <button
                type="button"
                className="
                  cursor-pointer rounded-full
                  border border-white/30
                  bg-white px-7 py-2.5
                  text-sm font-extrabold
                  text-slate-900
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-lg
                "
              >
                Packages
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
            className="
              relative z-10 ml-auto
              rounded-xl p-2 text-white
              transition hover:bg-white/10
              lg:hidden
            "
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
        onClose={() =>
          setIsOpenSignup(false)
        }
      />

      {/* Mobile sidebar overlay */}
      <div
        onClick={closeMobileMenu}
        className={`
          fixed inset-0 z-[9999]
          overflow-x-hidden
          transition-all duration-300
          lg:hidden
          ${
            mobileMenuOpen
              ? "visible bg-black/50 opacity-100 backdrop-blur-sm"
              : "invisible opacity-0"
          }
        `}
      >
        <aside
          onClick={(event) =>
            event.stopPropagation()
          }
          className={`
            absolute right-0 top-0
            h-full
            w-[min(18rem,100vw)]
            max-w-full
            overflow-x-hidden
            overflow-y-auto
            border-l border-[#31708E]/25
            bg-[linear-gradient(180deg,#000000_0%,#0B0B0B_45%,#111111_75%,#1A2429_100%)]
            p-6
            shadow-[0_30px_80px_rgba(0,0,0,0.75)]
            backdrop-blur-xl
            transition-transform duration-300
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* Glow border */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          {/* Top */}
          <div className="relative z-10 mb-8 flex min-w-0 items-center justify-between gap-3">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="flex min-w-0 items-center gap-2"
            >
              <img
                src={logo}
                alt="Carwash Logo"
                className="
                  h-10 shrink-0
                  cursor-pointer object-contain
                  brightness-0 invert opacity-90
                "
              />

              <span className="min-w-0 truncate text-xs font-black tracking-wide text-white sm:text-sm">
                Auto Care
              </span>
            </a>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="
                shrink-0 rounded-lg p-2
                text-slate-300 transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={22} />
            </button>
          </div>

          {/* Links */}
          <nav className="relative z-10 flex min-w-0 flex-col gap-5 overflow-x-hidden">
            <button
              type="button"
              onClick={() => {
                navigate("/");
                closeMobileMenu();
              }}
              className="
                min-w-0 rounded-xl
                px-3 py-2 text-left
                text-[15px] font-medium
                text-slate-300 transition
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className="
                min-w-0 break-words
                rounded-xl px-3 py-2
                text-[15px] font-medium
                text-slate-300 transition
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Services
            </a>

            <a
              href="#pricing"
              onClick={closeMobileMenu}
              className="
                min-w-0 break-words
                rounded-xl px-3 py-2
                text-[15px] font-medium
                text-slate-300 transition
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Pricing
            </a>

            <a
              href="#packages"
              onClick={closeMobileMenu}
              className="
                mt-6 flex w-fit
                cursor-pointer items-center
                justify-center rounded-xl
                bg-white px-5 py-3
                text-sm font-extrabold
                text-black transition
                hover:-translate-y-0.5
                hover:bg-[#2158bc]
                hover:text-white
                hover:shadow-[0_16px_36px_rgba(41,107,225,0.35)]
              "
            >
              Packages
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}