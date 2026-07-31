import logo from "@/assets/gaming_logo.png";
import SignupModal from "@/components/signup/gym";
import { Menu, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

export default function GamingHeader() {
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(
      (current) => !current,
    );
  };

  const navigateToMainArena = () => {
    navigate("/");
    closeMobileMenu();
  };

  /*
   * Header scroll behaviour:
   *
   * 1. Remains visible throughout the
   *    scroll-controlled gaming hero.
   * 2. Hides when scrolling down after the hero.
   * 3. Returns when scrolling up.
   * 4. Always remains visible on mobile/tablet.
   */
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

  /*
   * Prevent background scrolling only while
   * the mobile navigation is open.
   */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousBodyOverflowX =
      document.body.style.overflowX;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    const previousHtmlOverflowX =
      document.documentElement.style
        .overflowX;

    document.body.style.overflow =
      "hidden";

    document.body.style.overflowX =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    document.documentElement.style.overflowX =
      "hidden";

    setShowHeader(true);

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.body.style.overflowX =
        previousBodyOverflowX;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.documentElement.style.overflowX =
        previousHtmlOverflowX;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`
          fixed left-0 top-0 z-50
          w-full bg-transparent py-2
          transition-[transform,opacity]
          duration-300 ease-out
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
                  relative mx-auto flex
                  h-16 w-[calc(100%-1rem)]
                  max-w-[1180px]
                  items-center
                  justify-between
                  overflow-hidden
                  rounded-full
                  border
                  border-red-500/20
                  bg-black/80
                  px-4 py-1.5
                  shadow-[0_18px_50px_rgba(0,0,0,0.55)]
                  backdrop-blur-md
                  transition-all
                  duration-500
                  sm:w-[calc(100%-2rem)]
                  lg:h-20
                  lg:px-8
                  lg:py-2
                `
              : `
                  relative mx-auto flex
                  h-16 w-[calc(100%-1rem)]
                  max-w-[1180px]
                  items-center
                  justify-between
                  overflow-hidden
                  rounded-full
                  border
                  border-white/20
                  bg-[linear-gradient(135deg,rgba(0,0,0,0.92),rgba(65,5,8,0.82),rgba(150,15,20,0.52))]
                  px-4 py-1.5
                  shadow-[0_18px_50px_rgba(0,0,0,0.48)]
                  backdrop-blur-2xl
                  transition-all
                  duration-500
                  sm:w-[calc(100%-2rem)]
                  lg:h-20
                  lg:px-8
                  lg:py-2
                `
          }
        >
          {/* Header glow */}
          <div
            className={
              isScrolled
                ? `
                    pointer-events-none
                    absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_32%)]
                  `
                : `
                    pointer-events-none
                    absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.26),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]
                  `
            }
          />

          {/* Desktop navigation */}
          <nav className="relative z-10 hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={navigateToMainArena}
              className="
                cursor-pointer
                rounded-full
                px-4 py-2
                text-sm
                font-medium
                text-slate-200
                transition
                hover:bg-red-500/15
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#games"
              className="
                rounded-full
                px-4 py-2
                text-sm
                font-medium
                text-slate-200
                transition
                hover:bg-red-500/15
                hover:text-white
              "
            >
              Games
            </a>

            <a
              href="#movies"
              className="
                rounded-full
                px-4 py-2
                text-sm
                font-medium
                text-slate-200
                transition
                hover:bg-red-500/15
                hover:text-white
              "
            >
              Movies
            </a>
          </nav>

          {/* Logo */}
          <div
            className="
              absolute left-1/2
              z-10 flex
              max-w-[180px]
              -translate-x-1/2
              items-center gap-2
              sm:max-w-none
            "
          >
            <a
              href="#gaming-hero"
              aria-label="Gaming Zone home"
            >
              <img
                src={logo}
                alt="Gaming Zone"
                className="
                  h-8 w-auto
                  cursor-pointer
                  object-contain
                  lg:h-12
                "
              />
            </a>

            <a href="#gaming-hero">
              <span
                className="
                  cursor-pointer
                  truncate
                  text-xs
                  font-black
                  tracking-wide
                  text-white
                  sm:text-sm
                  lg:text-xl
                "
              >
                Gaming Zone
              </span>
            </a>
          </div>

          {/* Desktop booking button */}
          <div className="relative z-10 hidden lg:block">
            <a href="#bookings">
              <button
                type="button"
                className="
                  cursor-pointer
                  rounded-full
                  border
                  border-red-300/25
                  bg-gradient-to-r
                  from-red-800
                  via-red-600
                  to-red-500
                  px-7 py-2.5
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_12px_32px_rgba(220,38,38,0.28)]
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-[0_16px_40px_rgba(220,38,38,0.4)]
                "
              >
                Book Now
              </button>
            </a>
          </div>

          {/* Mobile navigation button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={
              mobileMenuOpen
            }
            className="
              relative z-10
              ml-auto rounded-xl
              p-2 text-white
              transition
              hover:bg-white/10
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
          fixed inset-0
          z-[9999]
          overflow-x-hidden
          transition-all
          duration-300
          lg:hidden
          ${
            mobileMenuOpen
              ? "visible bg-black/60 opacity-100 backdrop-blur-sm"
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
            border-l
            border-red-500/20
            bg-[linear-gradient(180deg,#000000_0%,#100305_45%,#1d0508_75%,#26070b_100%)]
            p-6
            shadow-[0_30px_80px_rgba(0,0,0,0.8)]
            backdrop-blur-xl
            transition-transform
            duration-300
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* Sidebar border glow */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          {/* Sidebar heading */}
          <div className="relative z-10 mb-8 flex min-w-0 items-center justify-between gap-3">
            <a
              href="#gaming-hero"
              onClick={
                closeMobileMenu
              }
              className="flex min-w-0 items-center gap-2"
            >
              <img
                src={logo}
                alt="Gaming Zone"
                className="
                  h-10 shrink-0
                  cursor-pointer
                  object-contain
                  opacity-90
                "
              />

              <span className="min-w-0 truncate text-xs font-black tracking-wide text-white sm:text-sm">
                Gaming Zone
              </span>
            </a>

            <button
              type="button"
              onClick={
                closeMobileMenu
              }
              aria-label="Close navigation menu"
              className="
                shrink-0
                rounded-lg
                p-2
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={22} />
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="relative z-10 flex min-w-0 flex-col gap-5 overflow-x-hidden">
            <button
              type="button"
              onClick={
                navigateToMainArena
              }
              className="
                min-w-0
                rounded-xl
                px-3 py-2
                text-left
                text-[15px]
                font-medium
                text-slate-300
                transition
                hover:bg-red-500/10
                hover:pl-4
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#games"
              onClick={
                closeMobileMenu
              }
              className="
                min-w-0
                break-words
                rounded-xl
                px-3 py-2
                text-[15px]
                font-medium
                text-slate-300
                transition
                hover:bg-red-500/10
                hover:pl-4
                hover:text-white
              "
            >
              Games
            </a>

            <a
              href="#movies"
              onClick={
                closeMobileMenu
              }
              className="
                min-w-0
                break-words
                rounded-xl
                px-3 py-2
                text-[15px]
                font-medium
                text-slate-300
                transition
                hover:bg-red-500/10
                hover:pl-4
                hover:text-white
              "
            >
              Movies
            </a>

            <a
              href="#bookings"
              onClick={
                closeMobileMenu
              }
              className="
                mt-6 flex
                w-fit
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                border
                border-red-300/20
                bg-gradient-to-r
                from-red-800
                via-red-600
                to-red-500
                px-5 py-3
                text-sm
                font-extrabold
                text-white
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_16px_36px_rgba(220,38,38,0.35)]
              "
            >
              Book Now
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}