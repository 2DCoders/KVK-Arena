import { CircleDot, Film, Gamepad2, Monitor } from "lucide-react";
import gamingPhoto from "@/assets/gaming-mobile.png";

const experiences = [
  { name: "PC Gaming", icon: Monitor },
  { name: "PS5", icon: Gamepad2 },
  { name: "Pool Tables", icon: CircleDot },
  { name: "Private Movie Rooms", icon: Film },
];

export default function GamingBookingsComingSoon() {
  return (
    <div className="bg-[#f6f7f9] px-4 py-10 text-slate-950 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-[#fff8f8] shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[2rem]">
        <img
          src={gamingPhoto}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover object-center opacity-20 md:w-2/3 md:object-right md:opacity-45"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-white/70 to-[#fff3f4] md:bg-gradient-to-r md:from-white md:via-[#fff8f8] md:to-[#fff3f4]/25" />

        <div className="px-5 py-9 sm:p-10 lg:p-14">
          <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Gaming bookings
            <span className="block text-red-700">coming soon</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
            Soon you’ll be able to book your next game, pool session, or private movie night online at KVK Arena.
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:mt-12">
            {experiences.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="flex min-w-0 flex-col items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm backdrop-blur-sm sm:p-5 lg:flex-row lg:items-center"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700 sm:size-10">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold leading-snug sm:text-base">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
