import hero_bg from "@/assets/hero/gaming_hero1.png";
import { ArrowRight } from "lucide-react";

export default function GamingHero() {
  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${hero_bg})`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[95vh] w-full max-w-7xl items-center px-6 lg:px-12">
        <div className="max-w-2xl">

          {/* Heading */}
          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl lg:text-6xl">
            ENTER THE
            <br />
            <span className="text-red-500">ARENA.</span>
            <br />
            PROVE YOUR SKILLS.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-md leading-relaxed text-slate-300">
            Join elite tournaments, challenge skilled opponents, and climb the
            rankings. Earn rewards, build your reputation, and become a
            champion.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-red-500">
              Book a Slot

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <button className="cursor-pointer rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
              Explore Games
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}