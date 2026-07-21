import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/kvk-arena-header-logo1.png";
import ConstructionModal from "../404";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [open404, setOpen404] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((current) => !current);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 600);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const desktopLinkClass = `
    rounded-full border border-transparent px-4 py-2
    text-sm font-medium text-gray-300
    transition-all duration-300
    hover:-translate-y-0.5
    hover:border-white/10
    hover:bg-white/[0.06]
    hover:text-white
    hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
  `;

  const mobileLinkClass = `
    rounded-xl border border-transparent px-4 py-3
    text-[15px] font-medium text-gray-300
    transition-all duration-300
    hover:border-blue-400/15
    hover:bg-blue-500/10
    hover:text-white
  `;

  return (
    <>
      <header className="fixed left-0 top-0 z-[9998] w-full px-3 py-2 sm:px-5 lg:px-8 lg:py-4">
        <ConstructionModal
          open={open404}
          onClose={() => setOpen404(false)}
          pageName="Services Section"
        />

        <div
          className={`relative mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between overflow-hidden rounded-full border px-4 py-1.5 backdrop-blur-2xl transition-all duration-500 lg:h-20 lg:px-8 lg:py-2 ${
            isScrolled
              ? "border-white/10 bg-black/50 shadow-[0_16px_45px_rgba(0,0,0,0.5)]"
              : "border-white/10 bg-[linear-gradient(135deg,rgba(2,2,2,0.96),rgba(9,9,9,0.92),rgba(20,20,20,0.84))] shadow-[0_20px_60px_rgba(0,0,0,0.68)]"
          }`}
        >
          {/* Left electric glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute -left-20 top-1/2 h-40 w-64 -translate-y-1/2 rounded-full blur-[70px] transition-opacity duration-500 ${
                isScrolled ? "bg-blue-600/10" : "bg-blue-600/20"
              }`}
            />

            <div className="absolute left-0 top-0 h-full w-28 bg-gradient-to-r from-blue-500/[0.1] to-transparent" />

            <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.35)]" />

            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Desktop navigation */}
          <nav className="relative z-10 hidden items-center gap-2 lg:flex">
            <a href="#" className={desktopLinkClass}>
              Home
            </a>

            <a href="#services" className={desktopLinkClass}>
              Services
            </a>

            <a href="#about" className={desktopLinkClass}>
              About
            </a>
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 z-10 -translate-x-1/2">
            <a
              href="#"
              aria-label="KVK Arena home"
              className="block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <img
                src={logo}
                alt="KVK Arena"
                className="h-8 w-auto cursor-pointer object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:h-9 lg:h-12"
              />
            </a>
          </div>

          {/* Desktop contact button */}
          <div className="relative z-10 hidden lg:block">
            <a
              href="#contact"
              className="
                group inline-flex items-center justify-center
                rounded-full border border-blue-400/20
                bg-[linear-gradient(135deg,#101010,#191919,#0b0b0b)]
                px-7 py-2.5
                text-sm font-bold tracking-[0.08em] text-white
                shadow-[0_12px_30px_rgba(0,0,0,0.48)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-blue-400/40
                hover:bg-[linear-gradient(135deg,#111827,#101827,#090909)]
                hover:shadow-[0_0_35px_rgba(37,99,235,0.2)]
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400/50
              "
            >
              Contact Us
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="
              relative z-10 ml-auto
              flex h-10 w-10 items-center justify-center
              rounded-full border border-white/10
              bg-white/[0.05] text-gray-200
              transition-all duration-300
              hover:border-blue-400/25
              hover:bg-blue-500/10
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400/40
              lg:hidden
            "
          >
            <Menu size={19} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[9999] transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "visible bg-black/65 opacity-100 backdrop-blur-sm"
            : "invisible opacity-0"
        }`}
      >
        {/* Mobile sidebar */}
        <aside
          onClick={(event) => event.stopPropagation()}
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-[330px] flex-col overflow-hidden border-l border-blue-400/15 bg-[linear-gradient(180deg,#030303_0%,#080808_48%,#111111_100%)] p-5 shadow-[-25px_0_70px_rgba(0,0,0,0.75)] transition-transform duration-300 sm:p-6 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sidebar effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-blue-600/55 blur-[100px]" />

            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/40 to-transparent shadow-[0_0_16px_rgba(59,130,246,0.4)]" />

            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* Sidebar top */}
          <div className="relative z-10 mb-8 flex items-center justify-between border-b border-white/10 pb-5">
            <a href="#" onClick={closeMobileMenu}>
              <img
                src={logo}
                alt="KVK Arena"
                className="h-10 w-auto cursor-pointer object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
              />
            </a>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full border border-white/10
                bg-white/[0.05] text-gray-300
                transition-all duration-300
                hover:border-blue-400/25
                hover:bg-blue-500/10
                hover:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400/40
              "
            >
              <X size={21} />
            </button>
          </div>

          {/* Mobile links */}
          <nav className="relative z-10 flex flex-col gap-2">
            <a href="#" onClick={closeMobileMenu} className={mobileLinkClass}>
              Home
            </a>

            <a
              href="#services"
              onClick={closeMobileMenu}
              className={mobileLinkClass}
            >
              Services
            </a>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className={mobileLinkClass}
            >
              About
            </a>

            <a
              href="#contact"
              onClick={closeMobileMenu}
              className={mobileLinkClass}
            >
              Contact
            </a>
          </nav>

          {/* Bottom contact action */}
          <div className="relative z-10 mt-auto border-t border-white/10 pt-5">
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="
                flex h-12 w-full items-center justify-center
                rounded-full border border-blue-400/25
                bg-[linear-gradient(135deg,#101010,#181818,#0b0b0b)]
                text-sm font-bold tracking-[0.08em] text-white
                shadow-[0_12px_30px_rgba(0,0,0,0.45)]
                transition-all duration-300
                hover:border-blue-400/45
                hover:bg-[linear-gradient(135deg,#111827,#0f172a,#090909)]
                hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]
              "
            >
              Contact Us
            </a>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-gray-600">
              Premium Auto Care
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}