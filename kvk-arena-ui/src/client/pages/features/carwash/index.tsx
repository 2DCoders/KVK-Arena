import {
  BrushCleaning,
  CarFront,
  Droplets,
  ShieldCheck,
  Sparkles,
  SprayCan,
} from "lucide-react";

import IMG from "@/assets/quality.png";

const leftServices = [
  {
    icon: Droplets,
    label: "Deep Wash",
    position: "left-[5%] top-[30%] lg:left-[8%]",
  },
  {
    icon: CarFront,
    label: "Body Cleaning",
    position: "left-[12%] top-[57%] lg:left-[15%]",
  },
  {
    icon: BrushCleaning,
    label: "Wheel Cleaning",
    position: "left-[27%] top-[21%] lg:left-[30%]",
  },
];

const rightServices = [
  {
    icon: SprayCan,
    label: "Premium Polish",
    position: "right-[27%] top-[21%] lg:right-[30%]",
  },
  {
    icon: Sparkles,
    label: "Perfect Finish",
    position: "right-[12%] top-[57%] lg:right-[15%]",
  },
  {
    icon: ShieldCheck,
    label: "Paint Protection",
    position: "right-[5%] top-[30%] lg:right-[8%]",
  },
];

export default function CarwashAdd1() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1473ff]/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#70a7ff]">
            Premium Car Care
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            See the Difference
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
            From a heavily used vehicle to a clean, polished and protected
            finish handled with professional care.
          </p>
        </div>

        {/* Main image */}
        <div className="group relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d] shadow-[0_35px_100px_rgba(0,0,0,0.75)] sm:min-h-[540px] lg:min-h-[680px]">
          <img
            src={IMG}
            alt="Car before and after professional wash"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.015]"
          />

          {/* Dark overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20" />

          {/* Top heading */}
          <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 sm:top-8 lg:top-10">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-5 py-3 shadow-2xl backdrop-blur-md sm:gap-3 sm:px-7">
              <span className="text-sm font-black uppercase tracking-[0.15em] text-white sm:text-xl lg:text-2xl">
                Before
              </span>

              <span className="text-sm font-black text-white/40 sm:text-xl">
                &
              </span>

              <span className="text-sm font-black uppercase tracking-[0.15em] text-[#1473ff] sm:text-xl lg:text-2xl">
                After
              </span>
            </div>
          </div>

          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/90 to-transparent shadow-[0_0_14px_rgba(255,255,255,0.75)]" />

          {/* Center indicator */}
          <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 sm:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/60 shadow-[0_0_30px_rgba(20,115,255,0.45)] backdrop-blur-md">
              <div className="h-2.5 w-2.5 rounded-full bg-[#1473ff] shadow-[0_0_12px_#1473ff]" />
            </div>
          </div>

          {/* Before label */}
          <div className="absolute bottom-5 left-5 z-20 sm:bottom-8 sm:left-8">
            <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Before
              </p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                Dirt, grime and stains
              </p>
            </div>
          </div>

          {/* After label */}
          <div className="absolute bottom-5 right-5 z-20 text-right sm:bottom-8 sm:right-8">
            <div className="rounded-2xl border border-[#1473ff]/25 bg-black/55 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#70a7ff]">
                After
              </p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                Clean, polished and protected
              </p>
            </div>
          </div>

          {/* Desktop service bubbles */}
          <div className="hidden md:block">
            {leftServices.map(({ icon: Icon, label, position }) => (
              <div
                key={label}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${position}`}
              >
                <div className="group/bubble relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white text-[#1473ff] shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition duration-300 hover:scale-110 lg:h-17 lg:w-17">
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.8} />
                  </div>

                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] w-max -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover/bubble:opacity-100">
                    {label}
                  </span>
                </div>
              </div>
            ))}

            {rightServices.map(({ icon: Icon, label, position }) => (
              <div
                key={label}
                className={`absolute z-20 translate-x-1/2 -translate-y-1/2 ${position}`}
              >
                <div className="group/bubble relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white text-[#1473ff] shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition duration-300 hover:scale-110 lg:h-17 lg:w-17">
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.8} />
                  </div>

                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] w-max -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover/bubble:opacity-100">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile service items */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:hidden">
          {[...leftServices, ...rightServices].map(
            ({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1473ff]/10 text-[#1473ff]">
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-xs font-medium text-white/75">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}