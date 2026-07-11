import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import * as FlipNumbersModule from "react-flip-numbers";
import hero_bg from "@/assets/hero/hero_bg2.png";
import { getEnv } from "@/env";

type HeroProps = {
  onOpenPromoCountdown: () => void;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const FlipNumbers = (FlipNumbersModule as any).default?.default ??
  (FlipNumbersModule as any).default;

function getTimeLeft(targetTime: number): TimeLeft {
  const total = Math.max(0, targetTime - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Hero({ onOpenPromoCountdown }: HeroProps) {
  const OFFER_END_DATE = getEnv().OFFER_END_DATE;
  const targetTime = new Date(OFFER_END_DATE).getTime();
  const isOfferActive =
    new Date().getTime() < new Date(OFFER_END_DATE).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetTime),
  );

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getTimeLeft(targetTime));

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [targetTime]);

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-24 sm:pb-28 sm:pt-15 lg:pb-10 lg:pt-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />
      {/* <div aria-hidden="true" className="absolute inset-0 rounded-lg bg-slate-950/20" /> */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-linear-to-b from-slate-950/30 via-slate-950/65 to-slate-950/85"
      />

      <div className="relative z-10 mx-auto mt-5 flex max-w-7xl flex-col items-center gap-8 px-4 pb-16 text-center lg:px-8 mb-5">
        <div className="hero-fade-up max-w-4xl">
          <h1 className="mt-6 mb-5 text-4xl font-black leading-[1.2] tracking-[-0.035em] block bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent sm:text-5xl lg:text-6xl xl:text-7xl">
            One arena for
            <span className="block bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
              movement, play, care.
            </span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base leading-8 text-slate-200 lg:text-md sm:text-md">
            Explore four connected experiences in a modern light-space design:
            Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move
            easier, and keep your day flowing in one place.
          </p>

          {isOfferActive && (
            <button
              type="button"
              onClick={onOpenPromoCountdown}
              data-aos="fade-up"
              className="z-50 mx-auto mt-5 flex flex-col cursor-pointer gap-4 rounded-sm p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.34)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-slate-950/95 sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
                  Membership Registration
                </span>

                <div className="mt-3 flex items-center gap-2">
                  {[
                    {
                      value: String(timeLeft.days).padStart(2, "0"),
                      label: "Days",
                    },
                    {
                      value: String(timeLeft.hours).padStart(2, "0"),
                      label: "Hours",
                    },
                    {
                      value: String(timeLeft.minutes).padStart(2, "0"),
                      label: "Min",
                    },
                    {
                      value: String(timeLeft.seconds).padStart(2, "0"),
                      label: "Sec",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex h-16 w-14 flex-col overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-lg"
                    >
                      <div className="flex flex-1 items-center justify-center bg-white/5">
                        <FlipNumbers
                          play
                          height={20}
                          perspective={800}
                          width={18}
                          color="#ffffff"
                          background="transparent"
                          numbers={item.value}
                        />
                      </div>

                      <div className="border-t border-white/10 bg-[#296BE1]/25 py-1 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3">
                  <Clock3 size={20} className="text-yellow-200/90" />
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-200/90">
                    Limited Time Offer
                  </span>
                </div>
              </div>
            </button>
          )}

          {!isOfferActive && (
            <div className="mt-9 flex justify-center items-center gap-4 sm:flex-row sm:justify-center">
              <a href="#services">
                <button className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be] sm:px-8 sm:py-4 sm:text-sm">
                  Explore Now
                </button>
              </a>
              <a href="#contact">
                <button className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/16 sm:px-8 sm:py-4 sm:text-sm">
                  Contact Us
                </button>
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 700ms ease forwards;
        }

        @keyframes hero-fade-up {
          0% {
            opacity: 0;
            transform: translateY(26px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
