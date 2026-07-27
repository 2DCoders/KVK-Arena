import logo from "@/assets/gym_logo.png";
import SignupModal from "@/components/signup/gym";
import UserProfileModal from "@/components/profile/gym";
import { Menu, User, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

export default function GymHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isOpenSignup, setIsOpenSignup] =
    useState(false);
  const [profileOpen, setProfileOpen] =
    useState(false);

  const navigate = useNavigate();

  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const memberId =
    localStorage.getItem("memberId") || null;
  const memberName =
    localStorage.getItem("memberName") || null;
  const memberEmail =
    localStorage.getItem("memberEmail") || null;
  const memberToken =
    localStorage.getItem("memberToken") || null;

  const isLoggedIn = Boolean(
    memberToken ||
      memberName ||
      memberEmail ||
      memberId,
  );

  const closeMobileMenu = () =>
    setMobileMenuOpen(false);

  const toggleMobileMenu = () =>
    setMobileMenuOpen((current) => !current);

  const handleMainArenaClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    closeMobileMenu();
    navigate("/");
  };

  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();
    closeMobileMenu();

    const section =
      document.querySelector<HTMLElement>(sectionId);

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

useEffect(() => {
  lastScrollYRef.current = window.scrollY;

  const updateHeader = () => {
    const currentScrollY = Math.max(window.scrollY, 0);
    const previousScrollY = lastScrollYRef.current;
    const scrollDifference = currentScrollY - previousScrollY;

    // 95% of the current viewport height
    const activationPoint = window.innerHeight * 4.95;

    setIsScrolled(currentScrollY > 100);

    /*
     * Keep the header visible until the user
     * scrolls past 95vh.
     */
    if (currentScrollY <= activationPoint) {
      setShowHeader(true);
      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
      return;
    }

    /*
     * Keep the header visible while a menu
     * or modal is open.
     */
    if (mobileMenuOpen || profileOpen || isOpenSignup) {
      setShowHeader(true);
      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
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

    lastScrollYRef.current = currentScrollY;
    tickingRef.current = false;
  };

  const handleScroll = () => {
    if (tickingRef.current) return;

    tickingRef.current = true;
    window.requestAnimationFrame(updateHeader);
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  updateHeader();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, [mobileMenuOpen, profileOpen, isOpenSignup]);

  /*
   * Prevent page scrolling while the mobile sidebar
   * is open.
   */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`
          fixed left-0 top-0 z-50 w-full
          bg-transparent px-3 py-2
          transition-all duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          sm:px-5
          lg:px-8 lg:py-4
          ${
            showHeader
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-[120%] opacity-0"
          }
        `}
      >
        <div
          className={`
            relative mx-auto flex h-16 w-full
            max-w-[1180px] items-center
            justify-between overflow-hidden
            rounded-full border px-4 py-1.5
            transition-all duration-500
            lg:h-20 lg:px-8 lg:py-2
            ${
              isScrolled
                ? `
                  border-white/10
                  bg-black/65
                  shadow-[0_18px_50px_rgba(0,0,0,0.35)]
                  backdrop-blur-xl
                `
                : `
                  border-white/20
                  bg-[linear-gradient(135deg,rgba(6,12,28,0.75),rgba(15,23,42,0.48),rgba(8,16,32,0.7))]
                  shadow-[0_18px_50px_rgba(2,6,23,0.45)]
                  backdrop-blur-2xl
                `
            }
          `}
        >
          {/* Header glow */}
          <div
            className={`
              pointer-events-none absolute inset-0
              transition-opacity duration-500
              ${
                isScrolled
                  ? `
                    bg-[radial-gradient(circle_at_top_left,rgba(41,107,225,0.1),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_30%)]
                  `
                  : `
                    bg-[radial-gradient(circle_at_top_left,rgba(41,107,225,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]
                  `
              }
            `}
          />

          {/* Left navigation */}
          <nav className="relative z-10 hidden items-center gap-2 lg:flex">
            <a
              href="/"
              onClick={handleMainArenaClick}
              className="
                rounded-full px-4 py-2
                text-sm font-medium text-slate-200
                transition duration-300
                hover:bg-white/10 hover:text-white
              "
            >
              Main Arena
            </a>

            <a
              href="#trainers"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "#trainers",
                )
              }
              className="
                rounded-full px-4 py-2
                text-sm font-medium text-slate-200
                transition duration-300
                hover:bg-white/10 hover:text-white
              "
            >
              Trainers
            </a>

            <a
              href="#memberships"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "#memberships",
                )
              }
              className="
                rounded-full px-4 py-2
                text-sm font-medium text-slate-200
                transition duration-300
                hover:bg-white/10 hover:text-white
              "
            >
              Membership Plans
            </a>
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 z-10 -translate-x-1/2">
            <a
              href="#top"
              onClick={(event) => {
                event.preventDefault();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="block"
              aria-label="Go to top"
            >
              <img
                src={logo}
                alt="KVK Gym"
                className="
                  h-8 w-auto cursor-pointer
                  object-contain
                  transition-transform duration-300
                  hover:scale-105
                  lg:h-12
                "
              />
            </a>
          </div>

          {/* Desktop action */}
          {!isLoggedIn ? (
            <div className="relative z-10 hidden lg:block">
              <button
                type="button"
                onClick={() =>
                  setIsOpenSignup(true)
                }
                className="
                  cursor-pointer rounded-full
                  border border-white/30
                  bg-white px-7 py-2.5
                  text-sm font-extrabold
                  text-slate-900
                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  transition duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_35px_rgba(41,107,225,0.3)]
                "
              >
                Join Now
              </button>
            </div>
          ) : (
            <div className="relative z-20 hidden lg:block">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(true)
                }
                className="
                  flex h-11 w-11 cursor-pointer
                  items-center justify-center
                  rounded-full
                  border border-white/20
                  bg-white/10
                  shadow-lg backdrop-blur-xl
                  transition-all duration-300
                  hover:scale-105
                  hover:bg-white/20
                  hover:shadow-[0_10px_30px_rgba(41,107,225,0.35)]
                "
                aria-label="Open profile"
              >
                <User className="h-5 w-5 text-white" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="
              relative z-10 ml-auto
              rounded-xl border border-white/10
              bg-white/5 p-2.5 text-white
              transition duration-300
              hover:bg-white/10
              lg:hidden
            "
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      <SignupModal
        open={isOpenSignup}
        onClose={() =>
          setIsOpenSignup(false)
        }
      />

      <UserProfileModal
        open={profileOpen}
        onClose={() =>
          setProfileOpen(false)
        }
      />

      {/* Mobile overlay */}
      <div
        onClick={closeMobileMenu}
        className={`
          fixed inset-0 z-[60]
          transition-all duration-300
          ${
            mobileMenuOpen
              ? "visible bg-black/60 opacity-100 backdrop-blur-sm"
              : "invisible opacity-0"
          }
        `}
      >
        {/* Mobile sidebar */}
        <aside
          onClick={(event) =>
            event.stopPropagation()
          }
          className={`
            absolute right-0 top-0
            h-full w-[min(82vw,320px)]
            overflow-y-auto
            border-l border-white/10
            bg-gradient-to-b
            from-slate-950 via-slate-900
            to-slate-950
            p-6
            shadow-[0_30px_80px_rgba(0,0,0,0.65)]
            backdrop-blur-xl
            transition-transform duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#296BE1]/20 blur-[80px]" />

          {/* Sidebar top */}
          <div className="relative z-10 mb-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="cursor-pointer"
            >
              <img
                src={logo}
                alt="KVK Gym"
                className="h-10 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="
                rounded-xl border
                border-white/10
                bg-white/5 p-2.5
                text-slate-300
                transition duration-300
                hover:bg-white/10
                hover:text-white
              "
              aria-label="Close navigation menu"
            >
              <X size={21} />
            </button>
          </div>

          {/* Mobile links */}
          <nav className="relative z-10 flex flex-col gap-2">
            <a
              href="/"
              onClick={handleMainArenaClick}
              className="
                rounded-2xl px-4 py-3.5
                text-[15px] font-medium
                text-slate-300
                transition duration-300
                hover:bg-white/10
                hover:pl-5 hover:text-white
              "
            >
              Main Arena
            </a>

            <a
              href="#trainers"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "#trainers",
                )
              }
              className="
                rounded-2xl px-4 py-3.5
                text-[15px] font-medium
                text-slate-300
                transition duration-300
                hover:bg-white/10
                hover:pl-5 hover:text-white
              "
            >
              Trainers
            </a>

            <a
              href="#memberships"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "#memberships",
                )
              }
              className="
                rounded-2xl px-4 py-3.5
                text-[15px] font-medium
                text-slate-300
                transition duration-300
                hover:bg-white/10
                hover:pl-5 hover:text-white
              "
            >
              Membership Plans
            </a>

            <div className="my-4 h-px bg-white/10" />

            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsOpenSignup(true);
                }}
                className="
                  mt-2 cursor-pointer
                  rounded-2xl bg-[#296BE1]
                  px-5 py-3.5
                  text-sm font-extrabold
                  text-white
                  shadow-[0_16px_36px_rgba(41,107,225,0.3)]
                  transition duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#2158bc]
                "
              >
                Join Now
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setProfileOpen(true);
                }}
                className="
                  mt-2 flex cursor-pointer
                  items-center justify-center
                  gap-3 rounded-2xl
                  border border-white/15
                  bg-white/10 px-5 py-3.5
                  text-sm font-bold text-white
                  transition duration-300
                  hover:bg-white/15
                "
              >
                <User className="h-5 w-5" />
                View Profile
              </button>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}