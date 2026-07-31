import logo from "@/assets/cafe-logo.png";
import SignupModal from "@/components/signup/gym";
import { Menu, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const MAP_URL =
  "https://maps.app.goo.gl/D9vcmL5WoNeubk1KA";

export default function CafeHeader() {
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
                  h-16
                  w-[calc(100%-1rem)]
                  max-w-[1180px]
                  items-center
                  justify-between
                  overflow-hidden
                  rounded-full
                  border
                  border-[#e3aa56]/25
                  bg-[linear-gradient(135deg,rgba(20,9,4,0.94),rgba(56,27,12,0.9),rgba(117,67,30,0.8))]
                  px-4 py-1.5
                  shadow-[0_18px_50px_rgba(20,8,2,0.5)]
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
                  h-16
                  w-[calc(100%-1rem)]
                  max-w-[1180px]
                  items-center
                  justify-between
                  overflow-hidden
                  rounded-full
                  border
                  border-white/20
                  bg-[linear-gradient(135deg,rgba(24,11,5,0.9),rgba(58,27,14,0.82),rgba(106,57,29,0.72),rgba(208,154,96,0.45))]
                  px-4 py-1.5
                  shadow-[0_18px_50px_rgba(25,10,3,0.3)]
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
          {/* Glow */}
          <div
            className={
              isScrolled
                ? `
                    pointer-events-none
                    absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(231,172,82,0.2),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_34%)]
                  `
                : `
                    pointer-events-none
                    absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(244,190,102,0.22),transparent_36%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]
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
                text-stone-200
                transition
                hover:bg-[#d99a52]/15
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#about"
              className="
                rounded-full
                px-4 py-2
                text-sm
                font-medium
                text-stone-200
                transition
                hover:bg-[#d99a52]/15
                hover:text-white
              "
            >
              About
            </a>

            <a
              href="#menu"
              className="
                rounded-full
                px-4 py-2
                text-sm
                font-medium
                text-stone-200
                transition
                hover:bg-[#d99a52]/15
                hover:text-white
              "
            >
              Menu
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
              href="#cafe-hero"
              aria-label="Cafe Bee home"
            >
              <img
                src={logo}
                alt="Cafe Bee"
                className="
                  h-9 w-auto
                  cursor-pointer
                  object-contain
                  lg:h-14
                "
              />
            </a>

            <a href="#cafe-hero">
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
                Cafe Bee
              </span>
            </a>
          </div>

          {/* Desktop visit button */}
          <div className="relative z-10 hidden lg:block">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noreferrer"
            >
              <button
                type="button"
                className="
                  cursor-pointer
                  rounded-full
                  border
                  border-[#f0c275]/30
                  bg-gradient-to-r
                  from-[#a96720]
                  via-[#d99a52]
                  to-[#efbd72]
                  px-7 py-2.5
                  text-sm
                  font-extrabold
                  text-[#2a160b]
                  shadow-[0_12px_32px_rgba(217,154,82,0.25)]
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-[0_16px_40px_rgba(217,154,82,0.38)]
                "
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

      {/* Mobile sidebar */}
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
              ? "visible bg-black/55 opacity-100 backdrop-blur-sm"
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
            border-[#d99a52]/25
            bg-[linear-gradient(180deg,#140904_0%,#241107_40%,#3b1d0d_72%,#5a3218_100%)]
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
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          {/* Sidebar top */}
          <div className="relative z-10 mb-8 flex min-w-0 items-center justify-between gap-3">
            <a
              href="#cafe-hero"
              onClick={closeMobileMenu}
              className="flex min-w-0 items-center gap-2"
            >
              <img
                src={logo}
                alt="Cafe Bee"
                className="
                  h-11 shrink-0
                  cursor-pointer
                  object-contain
                "
              />

              <span className="min-w-0 truncate text-xs font-black tracking-wide text-white sm:text-sm">
                Cafe Bee
              </span>
            </a>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="
                shrink-0
                rounded-lg p-2
                text-stone-300
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={22} />
            </button>
          </div>

          {/* Sidebar links */}
          <nav className="relative z-10 flex min-w-0 flex-col gap-5 overflow-x-hidden">
            <button
              type="button"
              onClick={navigateToMainArena}
              className="
                min-w-0
                rounded-xl
                px-3 py-2
                text-left
                text-[15px]
                font-medium
                text-stone-300
                transition
                hover:bg-[#d99a52]/10
                hover:pl-4
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="
                min-w-0
                rounded-xl
                px-3 py-2
                text-[15px]
                font-medium
                text-stone-300
                transition
                hover:bg-[#d99a52]/10
                hover:pl-4
                hover:text-white
              "
            >
              About
            </a>

            <a
              href="#menu"
              onClick={closeMobileMenu}
              className="
                min-w-0
                rounded-xl
                px-3 py-2
                text-[15px]
                font-medium
                text-stone-300
                transition
                hover:bg-[#d99a52]/10
                hover:pl-4
                hover:text-white
              "
            >
              Menu
            </a>

            <a
              href={MAP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={closeMobileMenu}
              className="
                mt-6 flex w-fit
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-[#a96720]
                via-[#d99a52]
                to-[#efbd72]
                px-5 py-3
                text-sm
                font-extrabold
                text-[#2a160b]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_16px_36px_rgba(217,154,82,0.35)]
              "
            >
              Visit Us
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}