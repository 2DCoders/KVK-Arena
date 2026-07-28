import logo from "@/assets/badminton_logo.png";
import SignupModal from "@/components/signup/gym";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BadmintonHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isOpenSignup, setIsOpenSignup] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((current) => !current);
  };

  const handleNavigateHome = () => {
    closeMobileMenu();
    navigate("/");
  };

  /*
   * Header scroll behaviour
   *
   * The badminton hero uses a 500vh scroll section.
   * The header remains visible while that animation is active.
   *
   * After the hero:
   * - scrolling down hides the header
   * - scrolling up shows the header
   */
  useEffect(() => {
    lastScrollY.current = Math.max(window.scrollY, 0);

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDifference = currentScrollY - lastScrollY.current;

      /*
       * Use 4.95 because the hero section is approximately 500vh.
       * Change this value if your hero height is different.
       */
      const activationPoint = window.innerHeight * 4.95;
      const isDesktop = window.innerWidth >= 1024;

      setIsScrolled(currentScrollY > activationPoint);

      /*
       * Keep the header visible on mobile and tablet.
       */
      if (!isDesktop) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Keep the header visible while the mobile menu is open.
       */
      if (mobileMenuOpen) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Keep the header visible while the scroll hero is playing.
       */
      if (currentScrollY <= activationPoint) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Hide/show only after the scroll hero.
       */
      if (scrollDifference > 6) {
        setShowHeader(false);
      } else if (scrollDifference < -6) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      window.requestAnimationFrame(updateHeader);
    };

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowHeader(true);
      }

      updateHeader();
    };

    updateHeader();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  /*
   * Lock page scrolling only while the mobile sidebar is open.
   *
   * This prevents the hero from scrolling behind the mobile menu,
   * but does not affect the hero during normal page scrolling.
   */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    setShowHeader(true);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [mobileMenuOpen]);

  /*
   * Close the mobile menu when the Escape key is pressed.
   */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
                  border border-[#B45F28]/35
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
                  border border-white/25
                  bg-[linear-gradient(135deg,rgba(0,0,0,0.78),rgba(92,45,20,0.78),rgba(180,95,40,0.58))]
                  px-4 py-1.5
                  shadow-[0_18px_50px_rgba(2,6,23,0.45)]
                  backdrop-blur-2xl
                  transition-all duration-500
                  sm:w-[calc(100%-2rem)]
                  lg:h-20 lg:px-8 lg:py-2
                `
          }
        >
          {/* Background glow */}
          <div
            className={
              isScrolled
                ? `
                    pointer-events-none absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(180,95,40,0.20),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_35%)]
                  `
                : `
                    pointer-events-none absolute inset-0
                    bg-[radial-gradient(circle_at_top_left,rgba(225,125,50,0.26),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_30%)]
                  `
            }
          />

          {/* Desktop navigation */}
          <nav className="relative z-10 hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="
                cursor-pointer rounded-full
                px-4 py-2 text-sm
                font-medium text-slate-200
                transition
                hover:bg-[#B45F28]/20
                hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#courts"
              className="
                rounded-full px-4 py-2
                text-sm font-medium
                text-slate-200 transition
                hover:bg-[#B45F28]/20
                hover:text-white
              "
            >
              Courts
            </a>

            <a
              href="#services"
              className="
                rounded-full px-4 py-2
                text-sm font-medium
                text-slate-200 transition
                hover:bg-[#B45F28]/20
                hover:text-white
              "
            >
              Services
            </a>
          </nav>

          {/* Centred logo */}
          <div
            className="
              absolute left-1/2 z-10
              flex max-w-[180px]
              -translate-x-1/2
              items-center gap-2
              sm:max-w-none
            "
          >
            <a href="#" aria-label="Badminton home">
              <img
                src={logo}
                alt="Badminton logo"
                className="
                  h-8 w-auto cursor-pointer
                  object-contain
                  lg:h-12
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
                BADMINTON
              </span>
            </a>
          </div>

          {/* Desktop booking button */}
          <div className="relative z-10 hidden lg:block">
            <a
              href="#bookings"
              className="
                inline-flex cursor-pointer
                items-center justify-center
                rounded-full
                border border-white/30
                bg-white px-7 py-2.5
                text-sm font-extrabold
                text-slate-900
                transition
                hover:-translate-y-0.5
                hover:bg-[#FFF7F0]
                hover:shadow-lg
              "
            >
              Book Now
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
              rounded-xl p-2
              text-white transition
              hover:bg-white/10
              lg:hidden
            "
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <SignupModal
        open={isOpenSignup}
        onClose={() => setIsOpenSignup(false)}
      />

      {/* Mobile menu overlay */}
      <div
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
        className={`
          fixed inset-0 z-[9999]
          overflow-hidden
          transition-all duration-300
          lg:hidden
          ${
            mobileMenuOpen
              ? "visible bg-black/60 opacity-100 backdrop-blur-sm"
              : "pointer-events-none invisible opacity-0"
          }
        `}
      >
        <aside
          onClick={(event) => event.stopPropagation()}
          className={`
            absolute right-0 top-0
            h-full
            w-[min(18rem,100vw)]
            max-w-full
            overflow-x-hidden
            overflow-y-auto
            border-l border-[#B45F28]/30
            bg-[linear-gradient(180deg,#080503_0%,#160C07_45%,#241209_75%,#32180C_100%)]
            p-6
            shadow-[0_30px_80px_rgba(0,0,0,0.75)]
            transition-transform duration-300 ease-out
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* Border and glow */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,95,40,0.22),transparent_34%)]" />

          {/* Mobile sidebar top */}
          <div className="relative z-10 mb-8 flex min-w-0 items-center justify-between gap-3">
            <a
              href="#"
              onClick={closeMobileMenu}
              className="flex min-w-0 items-center gap-2"
            >
              <img
                src={logo}
                alt="Badminton logo"
                className="
                  h-10 shrink-0
                  cursor-pointer object-contain
                  opacity-95
                "
              />

              <span className="min-w-0 truncate text-xs font-black tracking-wide text-white sm:text-sm">
                BADMINTON
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

          {/* Mobile navigation */}
          <nav className="relative z-10 flex min-w-0 flex-col gap-3 overflow-x-hidden">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="
                min-w-0 rounded-xl
                px-3 py-2.5 text-left
                text-[15px] font-medium
                text-slate-300 transition-all
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Main Arena
            </button>

            <a
              href="#courts"
              onClick={closeMobileMenu}
              className="
                min-w-0 break-words
                rounded-xl px-3 py-2.5
                text-[15px] font-medium
                text-slate-300 transition-all
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Courts
            </a>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className="
                min-w-0 break-words
                rounded-xl px-3 py-2.5
                text-[15px] font-medium
                text-slate-300 transition-all
                hover:bg-white/10
                hover:pl-4 hover:text-white
              "
            >
              Services
            </a>

            <a
              href="#bookings"
              onClick={closeMobileMenu}
              className="
                mt-6 flex w-fit
                cursor-pointer items-center
                justify-center rounded-xl
                bg-[#B45F28] px-5 py-3
                text-sm font-extrabold
                text-white transition
                hover:-translate-y-0.5
                hover:bg-[#D17435]
                hover:shadow-[0_16px_36px_rgba(180,95,40,0.35)]
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