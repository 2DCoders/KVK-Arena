import hero_bg from "@/assets/hero/gym-hero.png";
import UserProfileModal from "@/components/profile/gym";
import SignupModal from "@/components/signup/gym";
import { useState } from "react";

export default function GymHero() {
  const [isOpenSignup, setIsOpenSignup] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const memberId = localStorage.getItem("memberId") || null;
  const memberName = localStorage.getItem("memberName") || null;
  const memberEmail = localStorage.getItem("memberEmail") || null;
  const memberToken = localStorage.getItem("memberToken") || null;

  return (
    <div>
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <SignupModal open={isOpenSignup} onClose={() => setIsOpenSignup(false)} />
      <section className="relative py-30 isolate overflow-hidden py-16 sm:py-20 lg:py-38">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 rounded-lg"
          style={{ backgroundImage: `url(${hero_bg})` }}
        />

        {/* <div aria-hidden="true" className="absolute inset-0 rounded-lg bg-slate-950/20" /> */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-lg bg-linear-to-b from-slate-950/30 via-slate-950/65 to-slate-950/85"
        />

        <div className="relative z-10 mx-auto mt-5 flex max-w-7xl flex-col items-center gap-8 px-4 text-center lg:px-8 mb-5">
          <div className="hero-fade-up max-w-4xl">
            <h1 className="mt-6 mb-5 text-4xl font-black leading-[1.2] tracking-[-0.035em] block bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent sm:text-5xl lg:text-6xl xl:text-7xl">
              Transform Body.
              <span className="block bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                Elevate Your Life.
              </span>
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-base leading-8 text-slate-200 lg:text-md sm:text-md">
              Build strength, improve endurance, and stay consistent in a
              premium training space with modern equipment, cardio zones, and a
              motivating atmosphere.
            </p>

            <div className="mt-9 flex justify-center items-center gap-4 sm:flex-row sm:justify-center">
              {!memberToken && !memberName && !memberEmail && !memberId ? (
                <button
                  onClick={() => setIsOpenSignup(true)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be] sm:px-8 sm:py-4 sm:text-sm"
                >
                  Join Gym
                </button>
              ) : (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be] sm:px-8 sm:py-4 sm:text-sm"
                >
                  View Profile
                </button>
              )}
              <a href="#memberships">
                <button className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/16 sm:px-8 sm:py-4 sm:text-sm">
                  View Memberships
                </button>
              </a>
            </div>
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
    </div>
  );
}
