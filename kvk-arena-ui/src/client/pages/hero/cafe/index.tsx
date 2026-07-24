import hero_bg from "@/assets/hero/cafe_bg.png";
import {
  ArrowRight,
  Clock3,
  Coffee,
  MapPin,
  Star,
} from "lucide-react";

const MAP_URL = "https://maps.app.goo.gl/D9vcmL5WoNeubk1KA";

export default function CafeHero() {
  const scrollToMenu = () => {
    document
      .getElementById("menu")
      ?.scrollIntoView({ behavior: "smooth" });
  }; 

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-[#2b170d]">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat lg:bg-[center_42%]"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />

      {/* Image overlays */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#1d0e07]/95 via-[#2a160b]/72 to-[#2a160b]/5" />
      {/* <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#170a04]/85 via-transparent to-[#2a160b]/20" /> */}

      {/* Soft brown lighting effects */}
      <div className="absolute -left-28 top-20 -z-10 h-80 w-80 rounded-full bg-amber-500/35 blur-[110px]" />
      {/* <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-[130px]" /> */}

      {/* Decorative grain */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto flex min-h-[92vh] w-full max-w-7xl items-center px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-36">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          {/* Main content */}
          <div className="max-w-3xl">
            {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 shadow-lg backdrop-blur-md sm:text-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Freshly brewed, warmly served
            </div> */}

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Where every cup
              <span className="block bg-gradient-to-r from-[#fff0d5] via-[#e9b978] to-[#c9853d] bg-clip-text text-transparent">
                feels like home.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-stone-200/90 sm:text-lg sm:leading-8">
              Discover handcrafted coffee, freshly prepared bites and a calm,
              welcoming space created for conversations, work and memorable
              moments.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={scrollToMenu}
                className="group cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#d99a52] px-7 py-3.5 text-sm font-bold text-[#2b160b] shadow-[0_16px_40px_rgba(217,154,82,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e8ad68] focus:outline-none focus:ring-4 focus:ring-amber-300/30"
              >
                Explore Our Menu
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <a href={MAP_URL} target="_blank" rel="noreferrer" className="text-slate-900">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15"
              >
                <MapPin className="h-4 w-4 text-amber-300" />
                Visit Our Cafe
              </button>
              </a>
            </div>

            {/* Highlights */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/15 pt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
                  <Coffee className="h-5 w-5 text-amber-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Premium coffee
                  </p>
                  <p className="text-xs text-stone-300">Made fresh every day</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
                  <Clock3 className="h-5 w-5 text-amber-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Open every day
                  </p>
                  <p className="text-xs text-stone-300">
                    Relax whenever you visit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating feature card */}
          <div className="hidden justify-end lg:flex">
            <div className="relative w-full max-w-[340px] translate-y-20">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-amber-300/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#2e170c]/65 p-5 shadow-[0_30px_90px_rgba(18,8,3,0.45)] backdrop-blur-xl">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                      Today&apos;s favourite
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Signature Coffee
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-[#2b160b]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    4.9
                  </div>
                </div>

                <p className="text-sm leading-6 text-stone-300">
                  Rich espresso, smooth steamed milk and a balanced roasted
                  finish, carefully prepared by our baristas.
                </p>

                <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5">
                  <div>
                    <p className="text-xs text-stone-400">Starting from</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      LKR 650
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToMenu}
                    aria-label="View cafe menu"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[#321a0d] transition duration-300 hover:scale-105 hover:bg-amber-100"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}