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
    description: "Removes dirt, dust and road grime.",
    position: "left-[5%] top-[30%] lg:left-[8%]",
  },
  {
    icon: CarFront,
    label: "Body Cleaning",
    description: "Complete exterior surface cleaning.",
    position: "left-[12%] top-[57%] lg:left-[15%]",
  },
  {
    icon: BrushCleaning,
    label: "Wheel Cleaning",
    description: "Detailed cleaning for wheels and tyres.",
    position: "left-[27%] top-[21%] lg:left-[30%]",
  },
];

const rightServices = [
  {
    icon: SprayCan,
    label: "Premium Polish",
    description: "Restores smoothness and visible shine.",
    position: "right-[27%] top-[21%] lg:right-[30%]",
  },
  {
    icon: Sparkles,
    label: "Perfect Finish",
    description: "A clean and professionally finished look.",
    position: "right-[12%] top-[57%] lg:right-[15%]",
  },
  {
    icon: ShieldCheck,
    label: "Paint Protection",
    description: "Helps protect the exterior paintwork.",
    position: "right-[5%] top-[30%] lg:right-[8%]",
  },
];

const allServices = [
  ...leftServices,
  ...rightServices,
];

export default function CarwashAdd1() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1473ff]/10 blur-[130px]" />

      <div className="pointer-events-none absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-500/[0.05] blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#1473ff]/[0.05] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
        {/* =====================================================
            HEADING
        ====================================================== */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1473ff] shadow-[0_0_10px_rgba(20,115,255,0.9)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#70a7ff] sm:text-xs">
              Premium Car Care
            </span>
          </div>

          <h2 className="text-[2.5rem] font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            See the

            <span className="ml-2 bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent">
              Difference
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/50 sm:text-base sm:leading-7">
            From a heavily used vehicle to a clean,
            polished and protected finish handled
            with professional care.
          </p>
        </div>

        {/* =====================================================
            MOBILE IMAGE
        ====================================================== */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d] shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            {/* Image */}
            <div className="relative h-[520px] overflow-hidden min-[390px]:h-[580px]">
              <img
                src={IMG}
                alt="Car before and after professional wash"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              {/* Dark overlays */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/15" />

              {/* Top heading */}
              <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2">
                <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-5 py-2.5 shadow-2xl backdrop-blur-xl">
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white">
                    Before
                  </span>

                  <span className="text-[11px] font-black text-white/35">
                    &
                  </span>

                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#70a7ff]">
                    After
                  </span>
                </div>
              </div>

              {/* Center divider */}
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent shadow-[0_0_14px_rgba(255,255,255,0.75)]" />

              {/* Center handle */}
              <div className="absolute left-1/2 top-[47%] z-20 -translate-x-1/2 -translate-y-1/2">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/60 shadow-[0_0_30px_rgba(20,115,255,0.4)] backdrop-blur-md">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1473ff] shadow-[0_0_12px_#1473ff]" />
                </div>
              </div>

              {/* Before label */}
              <div className="absolute bottom-5 left-4 z-20 max-w-[46%]">
                <div className="rounded-2xl border border-white/10 bg-black/60 px-3.5 py-3 shadow-xl backdrop-blur-xl">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/45" />

                    <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/45">
                      Before
                    </p>
                  </div>

                  <p className="text-[11px] font-semibold leading-4 text-white">
                    Dirt, grime and stains
                  </p>
                </div>
              </div>

              {/* After label */}
              <div className="absolute bottom-5 right-4 z-20 max-w-[46%] text-right">
                <div className="rounded-2xl border border-[#1473ff]/25 bg-black/60 px-3.5 py-3 shadow-xl backdrop-blur-xl">
                  <div className="mb-1.5 flex items-center justify-end gap-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#70a7ff]">
                      After
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-[#1473ff] shadow-[0_0_8px_#1473ff]" />
                  </div>

                  <p className="text-[11px] font-semibold leading-4 text-white">
                    Clean, polished and protected
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile summary */}
            <div className="border-t border-white/10 bg-[#080a0d] px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-300/15 bg-[#1473ff]/10 text-[#70a7ff]">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                    Professional Transformation
                  </p>

                  <p className="mt-1.5 text-xs leading-5 text-white/45">
                    Careful cleaning, polishing and
                    protection for a noticeably
                    improved finish.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              MOBILE SERVICES
          ====================================================== */}
          <div className="mt-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#70a7ff]">
                  What We Improve
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Complete vehicle care
                </h3>
              </div>

              <span className="text-[10px] font-medium text-white/35">
                06 Services
              </span>
            </div>

            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {allServices.map(
                ({
                  icon: Icon,
                  label,
                  description,
                }) => (
                  <article
                    key={label}
                    className="group min-w-[245px] snap-start rounded-[22px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm transition active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl border border-blue-300/15 bg-[#1473ff]/10 text-[#70a7ff]">
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={1.8}
                        />
                      </div>

                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
                        KVK Care
                      </span>
                    </div>

                    <h4 className="mt-5 text-sm font-bold uppercase tracking-[0.04em] text-white">
                      {label}
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-white/45">
                      {description}
                    </p>

                    <div className="mt-4 h-px w-full bg-gradient-to-r from-[#1473ff]/40 to-transparent" />
                  </article>
                ),
              )}
            </div>

            {/* Mobile scroll indicator */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[#1473ff]" />

              <span className="h-1.5 w-1.5 rounded-full bg-white/15" />

              <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLET / DESKTOP IMAGE
        ====================================================== */}
        <div className="group relative hidden min-h-[540px] overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d] shadow-[0_35px_100px_rgba(0,0,0,0.75)] md:block lg:min-h-[680px]">
          <img
            src={IMG}
            alt="Car before and after professional wash"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.015]"
          />

          {/* Dark overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/45" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20" />

          {/* Top heading */}
          <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 lg:top-10">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/45 px-7 py-3 shadow-2xl backdrop-blur-md">
              <span className="text-xl font-black uppercase tracking-[0.15em] text-white lg:text-2xl">
                Before
              </span>

              <span className="text-xl font-black text-white/40">
                &
              </span>

              <span className="text-xl font-black uppercase tracking-[0.15em] text-[#1473ff] lg:text-2xl">
                After
              </span>
            </div>
          </div>

          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/90 to-transparent shadow-[0_0_14px_rgba(255,255,255,0.75)]" />

          {/* Center indicator */}
          <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/60 shadow-[0_0_30px_rgba(20,115,255,0.45)] backdrop-blur-md">
              <div className="h-2.5 w-2.5 rounded-full bg-[#1473ff] shadow-[0_0_12px_#1473ff]" />
            </div>
          </div>

          {/* Before label */}
          <div className="absolute bottom-8 left-8 z-20">
            <div className="rounded-2xl border border-white/10 bg-black/55 px-6 py-4 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Before
              </p>

              <p className="mt-1 text-base font-semibold text-white">
                Dirt, grime and stains
              </p>
            </div>
          </div>

          {/* After label */}
          <div className="absolute bottom-8 right-8 z-20 text-right">
            <div className="rounded-2xl border border-[#1473ff]/25 bg-black/55 px-6 py-4 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#70a7ff]">
                After
              </p>

              <p className="mt-1 text-base font-semibold text-white">
                Clean, polished and protected
              </p>
            </div>
          </div>

          {/* Desktop left service bubbles */}
          {leftServices.map(
            ({
              icon: Icon,
              label,
              position,
            }) => (
              <div
                key={label}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${position}`}
              >
                <div className="group/bubble relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white text-[#1473ff] shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition duration-300 hover:scale-110 lg:h-17 lg:w-17">
                    <Icon
                      className="h-6 w-6 lg:h-7 lg:w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] w-max -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover/bubble:opacity-100">
                    {label}
                  </span>
                </div>
              </div>
            ),
          )}

          {/* Desktop right service bubbles */}
          {rightServices.map(
            ({
              icon: Icon,
              label,
              position,
            }) => (
              <div
                key={label}
                className={`absolute z-20 translate-x-1/2 -translate-y-1/2 ${position}`}
              >
                <div className="group/bubble relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white text-[#1473ff] shadow-[0_10px_35px_rgba(0,0,0,0.55)] transition duration-300 hover:scale-110 lg:h-17 lg:w-17">
                    <Icon
                      className="h-6 w-6 lg:h-7 lg:w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] w-max -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition group-hover/bubble:opacity-100">
                    {label}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}