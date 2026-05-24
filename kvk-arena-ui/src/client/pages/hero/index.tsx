import { useEffect, useState } from "react";


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

  return (
    <section className="relative overflow-hidden bg-[#fefcf8] py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(41,107,225,0.18),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(41,107,225,0.14),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f5f9ff_42%,#fffdf9_100%)]" />
      <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[#296BE1]/20 blur-3xl" />
      <div className="absolute -right-20 bottom-4 h-64 w-64 rounded-full bg-[#296BE1]/15 blur-3xl" />

      <div className="relative mt-5 z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 lg:px-8 text-center">
        <div className="hero-fade-up max-w-4xl">
          

          <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-[-0.035em] text-slate-950 sm:text-6xl lg:text-7xl xl:text-8xl">
            One arena for
            <span className="block bg-gradient-to-r from-[#296BE1] via-slate-900 to-[#296BE1] bg-clip-text text-transparent">
              movement, play, care.
            </span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Explore four connected experiences in a modern light-space design: Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move easier, and keep your day flowing in one place.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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