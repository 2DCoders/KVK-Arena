// import Circle from "../../circle";
// import LineBanner from "../../line-banner";
import { useLayoutEffect, useState, useEffect } from "react";
import CarwashHeader from "@/components/header/carwash";
import CarwashHero from "../../hero/carwash";
import CarwashServices from "../../services/carwash";
import CarwashAdd1 from "../../features/carwash";
import CarwashPricing from "../../pricing/carwash";
import CarwashAdd2 from "../../features/carwash/adds";
import CarwashFooter from "@/components/footer/carwash";
import CarwashPackages from "../../packages/carwash";

export default function CarwashHome() {
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const nextPercent =
        scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      setScrollPercent(Math.min(100, Math.max(0, nextPercent)));
      setShowScrollButton(scrollTop > 300);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <CarwashHeader />
      <CarwashHero />

      <section id="services">
        <CarwashServices />
      </section>

      <CarwashAdd1 />

      <CarwashPricing />

      <CarwashAdd2 />

      <section id="packages">
        <CarwashPackages />
      </section>

      <CarwashFooter />

      <div className="fixed bottom-6 right-4 z-50 flex items-end gap-3 sm:bottom-8 sm:right-6">
        <div className="flex min-w-18 flex-col items-center rounded-full border border-white/30 bg-slate-950/85 px-3 py-2 text-white shadow-[0_18px_45px_rgba(15,23,42,0.32)] backdrop-blur-md">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
            Page
          </span>
          <span className="text-lg font-bold leading-none">
            {scrollPercent}%
          </span>
        </div>

        {showScrollButton && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="flex cursor-pointer h-13 w-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_45px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(41,107,225,0.42)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
