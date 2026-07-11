import { useEffect, useState } from "react";
import Main from "@/client/layouts/main";
import Hero from "../hero";
import PromoCountdownModal, {
  PROMO_COUNTDOWN_STORAGE_KEY,
} from "@/components/promo-countdown-modal";
import BrandsSlider from "../brands-slider";
import Services from "../services";
import AboutUs from "../about-us";
import ContactUs from "../contact-us";
import ArenaMembership from "../arena-membership";
import { getEnv } from "@/env";
import WorkFlow from "../work-flow";

function WhatsappIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M12 2.25c-5.376 0-9.75 4.268-9.75 9.52 0 1.851.555 3.658 1.607 5.212L2.5 21.75l4.908-1.272a9.86 9.86 0 0 0 4.592 1.12c5.376 0 9.75-4.268 9.75-9.52S17.376 2.25 12 2.25Zm0 17.25c-1.424 0-2.816-.382-4.025-1.104l-.288-.172-2.912.755.778-2.787-.187-.29A7.99 7.99 0 0 1 4.5 11.77C4.5 7.352 8.074 3.75 12.5 3.75s8 3.602 8 8.02-3.575 7.73-8.5 7.73Zm4.604-5.73c-.247-.123-1.46-.72-1.687-.805-.227-.083-.392-.124-.557.124-.165.247-.64.804-.784.969-.143.165-.287.186-.534.062-.248-.124-1.046-.385-1.993-1.229-.737-.657-1.234-1.47-1.38-1.717-.144-.248-.015-.382.11-.505.113-.112.248-.29.372-.433.124-.144.165-.248.248-.413.083-.165.042-.309-.021-.433-.062-.124-.557-1.34-.763-1.833-.201-.483-.405-.417-.557-.425l-.474-.008c-.165 0-.433.062-.66.309-.227.247-.866.845-.866 2.061 0 1.216.886 2.391 1.01 2.556.123.165 1.748 2.667 4.232 3.742.591.255 1.053.408 1.413.522.594.189 1.135.162 1.563.098.477-.071 1.46-.597 1.666-1.173.206-.577.206-1.07.144-1.173-.062-.103-.227-.165-.474-.288Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M16.5 2.5c.6 2.9 2.4 4.8 5 5.1v3.1c-1.7.1-3.3-.4-4.9-1.3v6.1c0 4.1-3.1 6.8-7 6.8-2 0-3.8-.6-5.1-1.8-1.6-1.5-2.4-3.6-2.4-5.8 0-4.3 3.4-7.7 7.6-7.7.5 0 1 .1 1.5.2v3.3c-.5-.2-1-.3-1.5-.3-2.3 0-4.1 1.8-4.1 4 0 1.1.4 2.1 1.2 2.8.7.7 1.7 1.1 2.9 1.1 2.3 0 4.2-1.5 4.2-4.3V2.5h2.6Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M13.5 8.5V7.1c0-.7.4-1.1 1.1-1.1H16V2.5h-2c-2.8 0-4.5 1.7-4.5 4.7v1.3H7v3.4h2.5v9.6h4V11.9h2.6l.4-3.4h-3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M7.75 2.5h8.5A5.25 5.25 0 0 1 21.5 7.75v8.5a5.25 5.25 0 0 1-5.25 5.25h-8.5A5.25 5.25 0 0 1 2.5 16.25v-8.5A5.25 5.25 0 0 1 7.75 2.5Zm0 1.75A3.5 3.5 0 0 0 4.25 7.75v8.5a3.5 3.5 0 0 0 3.5 3.5h8.5a3.5 3.5 0 0 0 3.5-3.5v-8.5a3.5 3.5 0 0 0-3.5-3.5h-8.5Zm4.25 3.2a4.55 4.55 0 1 1 0 9.1 4.55 4.55 0 0 1 0-9.1Zm0 1.65a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm4.75-2.1a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z" />
    </svg>
  );
}

export default function Home() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [promoCountdownOpen, setPromoCountdownOpen] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem(PROMO_COUNTDOWN_STORAGE_KEY) !== "true";
  });
  const OFFER_END_DATE = getEnv().OFFER_END_DATE;
    const isOfferActive = new Date().getTime() < new Date(OFFER_END_DATE).getTime();

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

  const openPromoCountdown = () => {
    setPromoCountdownOpen(true);
  };

  const closePromoCountdown = () => {
    setPromoCountdownOpen(false);
  };

  return (
    <Main>
      <PromoCountdownModal
        isOpen={promoCountdownOpen}
        onClose={closePromoCountdown}
      />
      <div className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 pr-0">
        <a
          href="https://wa.me/+94765605885"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="flex h-10 w-10 items-center justify-center rounded-l-sm bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.28)] transition duration-300 hover:-translate-x-1 hover:scale-105 hover:shadow-[0_16px_40px_rgba(37,211,102,0.36)]"
        >
          <WhatsappIcon />
        </a>
        <a
          href="https://www.tiktok.com/@kvk.arena?_r=1&_t=ZS-96Z68QaWNRh"
          target="_blank"
          rel="noreferrer"
          aria-label="TikTok"
          className="flex h-10 w-10 items-center justify-center rounded-l-sm bg-[#111111] text-white shadow-[0_12px_30px_rgba(17,17,17,0.22)] transition duration-300 hover:-translate-x-1 hover:scale-105"
        >
          <TikTokIcon />
        </a>
        <a
          href="https://www.facebook.com/share/1A6qJ3RfSy/?mibextid=wwXIfr"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          className="flex h-10 w-10 items-center justify-center rounded-l-sm bg-[#1877F2] text-white shadow-[0_12px_30px_rgba(24,119,242,0.28)] transition duration-300 hover:-translate-x-1 hover:scale-105 hover:shadow-[0_16px_40px_rgba(24,119,242,0.36)]"
        >
          <FacebookIcon />
        </a>
        <a
          href="https://www.instagram.com/kvk_arena"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="flex h-10 w-10 items-center justify-center rounded-l-sm bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-[0_12px_30px_rgba(221,42,123,0.28)] transition duration-300 hover:-translate-x-1 hover:scale-105 hover:shadow-[0_16px_40px_rgba(221,42,123,0.36)]"
        >
          <InstagramIcon />
        </a>
      </div>

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
            className="flex cursor-pointer h-13 w-13 items-center justify-center rounded-full bg-[#296BE1] text-white shadow-[0_18px_45px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(41,107,225,0.42)]"
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

      <Hero onOpenPromoCountdown={openPromoCountdown} />
      <BrandsSlider />

      <section
        id="services"
        className="relative overflow-hidden py-10 lg:py-16"
      >
        <Services />
      </section>

      {!isOfferActive && (
        <WorkFlow />
      )}     

      <section id="add" className="relative overflow-hidden">
        <ArenaMembership />
      </section>

      {/* <Feedbacks /> */}

      {/* <section id="gallery" className="relative overflow-hidden">
                <Gallery />
            </section> */}

      <section id="about" className="relative overflow-hidden">
        <AboutUs />
      </section>

      <section id="contact" className="relative overflow-hidden">
        <ContactUs />
      </section>
    </Main>
  );
}
