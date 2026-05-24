import type { CSSProperties } from "react";

import { Car, Dumbbell, Gamepad2, Medal } from "lucide-react";

const backgroundIcons = [
  {
    title: "Gym",
    className: "left-[6%] top-[16%] h-14 w-14 sm:h-16 sm:w-16",
    delay: "0ms",
    floatDuration: "8.5s",
    spinDuration: "18s",
    children: <Dumbbell className="h-7 w-7 text-[#296BE1]" aria-hidden="true" strokeWidth={1.9} />,
  },
  {
    title: "Carwash",
    className: "right-[7%] top-[22%] h-16 w-16 sm:h-20 sm:w-20",
    delay: "500ms",
    floatDuration: "9.5s",
    spinDuration: "22s",
    children: <Car className="h-8 w-8 text-[#296BE1]" aria-hidden="true" strokeWidth={1.9} />,
  },
  {
    title: "Badminton Court",
    className: "left-[12%] bottom-[20%] h-15 w-15 sm:h-18 sm:w-18",
    delay: "900ms",
    floatDuration: "10.5s",
    spinDuration: "25s",
    children: <Medal className="h-8 w-8 text-[#296BE1]" aria-hidden="true" strokeWidth={1.9} />,
  },
  {
    title: "Gaming Centre",
    className: "right-[13%] bottom-[16%] h-14 w-14 sm:h-16 sm:w-16",
    delay: "1300ms",
    floatDuration: "8.8s",
    spinDuration: "19s",
    children: <Gamepad2 className="h-7 w-7 text-[#296BE1]" aria-hidden="true" strokeWidth={1.9} />,
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
      

      <div className="relative z-10 mx-auto mt-5 flex max-w-7xl flex-col items-center gap-8 px-4 text-center lg:px-8">
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
            <button className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be]">
              Sign Up Now
            </button>
            <button className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#296BE1]/35 bg-white px-8 py-4 text-sm font-semibold text-[#296BE1] shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#296BE1] hover:bg-[#296BE1]/5">
              Sign In
            </button>
          </div>
          
          
        </div>
      </div>


      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 700ms ease forwards;
        }

        .hero-floating-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          opacity: 0.85;
          animation: hero-float var(--hero-float-duration, 7s) ease-in-out infinite,
            hero-spin var(--hero-spin-duration, 20s) linear infinite;
        }

        .hero-orbit-ring {
          animation: hero-orbit var(--hero-spin-duration, 20s) linear infinite reverse;
        }

        .hero-orbit-dot {
          animation: hero-pulse 2.8s ease-in-out infinite;
        }

        .hero-orbit-dot-b {
          animation-delay: 1.2s;
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

        @keyframes hero-float {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-16px) translateX(8px) rotate(8deg) scale(1.04);
          }
        }

        @keyframes hero-spin {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.02);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes hero-orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes hero-pulse {
          0%,
          100% {
            transform: scale(0.92);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up,
          .hero-fade-up-delay,
          .hero-slide-card,
          .hero-floating-icon,
          .hero-orbit-ring,
          .hero-orbit-dot {
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