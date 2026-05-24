import { useEffect, useState } from "react";

import heroImage from "@/assets/hero/gym-hero.png";

const services = [
  {
    title: "Gym",
    subtitle: "Strength and functional training",
    description: "Coach-led sessions, recovery corners, and a premium workout floor.",
  },
  {
    title: "Carwash",
    subtitle: "Fast and detailed vehicle care",
    description: "Drop in before training and collect your ride spotless after your session.",
  },
  {
    title: "Badminton Court",
    subtitle: "Professional indoor courts",
    description: "Book singles or doubles slots with smooth surfaces and bright lighting.",
  },
  {
    title: "Gaming Centre",
    subtitle: "Console and esports lounge",
    description: "Compete, unwind, and host game nights with high-speed connectivity.",
  },
];

const stats = [
  { value: "4", label: "Core experiences" },
  { value: "7 days", label: "Open weekly" },
  { value: "1 app", label: "One booking flow" },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = services.length;
  const activeService = services[activeSlide];

  const goToPrevious = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [isPaused, totalSlides]);

  return (
    <section className="relative overflow-hidden bg-[#fefcf8] py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(41,107,225,0.18),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(41,107,225,0.14),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f5f9ff_42%,#fffdf9_100%)]" />
      <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[#296BE1]/20 blur-3xl" />
      <div className="absolute -right-20 bottom-4 h-64 w-64 rounded-full bg-[#296BE1]/15 blur-3xl" />

      <div className="relative mt-5 z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div className="hero-fade-up max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#296BE1]/25 bg-[#296BE1]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#296BE1] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            KVK Arena Lifestyle Hub
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            One arena for
            <span className="block bg-gradient-to-r from-[#296BE1] via-slate-900 to-[#296BE1] bg-clip-text text-transparent">
              movement, care, play.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Explore four connected experiences in a modern light-space design: Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move easier, and keep your day flowing in one place.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-full bg-[#296BE1] px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be]">
              Plan Your Visit
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-[#296BE1]/35 bg-white px-8 py-4 text-sm font-semibold text-[#296BE1] shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#296BE1] hover:bg-[#296BE1]/5">
              View Facilities
            </button>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
              >
                <div className="text-2xl font-black tracking-[-0.03em] text-[#296BE1]">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-fade-up-delay relative">
          <div className="rounded-[2rem] border border-white p-1 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-6">
            {/* <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#296BE1]/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#296BE1]">Featured Zones</p>
              <p className="text-xs font-medium text-slate-500">Gym • Carwash • Court • Gaming</p>
            </div> */}

            <div className="rounded-2xl border border-[#296BE1]/15 bg-white p-1 sm:p-2.5">
              <article
                key={activeService.title}
                className="hero-slide-card group relative overflow-hidden rounded-2xl border border-[#296BE1]/20 bg-white"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <img
                  src={heroImage}
                  alt={`${activeService.title} preview`}
                  className="h-[320px] w-full object-cover sm:h-[360px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-900/26 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#296BE1] sm:left-4 sm:top-4">
                  {activeService.subtitle}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <h3 className="text-2xl font-black tracking-[-0.02em] sm:text-3xl">{activeService.title}</h3>
                  <p className="mt-2 max-w-[90%] text-sm leading-6 text-white/85 sm:text-base sm:leading-7">{activeService.description}</p>
                </div>
              </article>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {services.map((service, index) => (
                    <button
                      key={service.title}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Go to ${service.title}`}
                      aria-pressed={activeSlide === index}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeSlide === index ? "w-8 bg-[#296BE1]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    aria-label="Previous featured zone"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#296BE1]/35 text-[#296BE1] transition duration-200 hover:bg-[#296BE1]/10"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next featured zone"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#296BE1] text-white transition duration-200 hover:bg-[#1f58be]"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 700ms ease forwards;
        }

        .hero-fade-up-delay {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 760ms ease forwards;
          animation-delay: 140ms;
        }

        .hero-slide-card {
          opacity: 0;
          transform: translateY(20px) scale(0.985);
          animation: hero-service-enter 620ms ease forwards;
          transition: transform 280ms ease, box-shadow 280ms ease;
        }

        .hero-slide-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 36px rgba(41, 107, 225, 0.24);
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

        @keyframes hero-service-enter {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up,
          .hero-fade-up-delay,
          .hero-slide-card {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        @media (max-width: 640px) {
          .hero-slide-card img {
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}