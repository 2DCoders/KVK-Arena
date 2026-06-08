import hero_bg from "@/assets/hero/gaming_hero1.png";
import { ArrowRight } from "lucide-react";

export default function GamingHero() {
  return (
    <section className="relative isolate overflow-hidden flex items-center py-30 min-h-[95vh]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />


      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl">

          <h1 className="mt-6 text-5xl md:text-5xl lg:text-5xl font-black uppercase tracking-tight text-white leading-[0.95]">
            ENTER THE 
            <br />
            <span className="text-red-500">ARENA.</span>
            <br />
            PROVE YOUR SKILLS.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
            Join elite tournaments, challenge skilled opponents, and climb
            the rankings. Earn rewards, build your reputation, and become a
            champion.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="group inline-flex items-center gap-2 rounded-lg bg-red-600 px-8 py-4 font-semibold text-white transition hover:bg-red-500">
              Start Playing
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <button className="rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
              Explore Tournaments
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}