import {
  BadgeCheck,
  Clock3,
  Droplets,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import machineImg from "@/assets/auto_wash.png";

export default function CarwashAdd2() {

  return (
    <section className="relative overflow-hidden bg-[#020408] py-20 sm:py-24 lg:py-32">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left blue glow */}
        <div className="absolute -left-52 top-[10%] h-[560px] w-[560px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute -left-20 bottom-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.08] blur-[130px]" />

        {/* Right silver glow */}
        <div className="absolute -right-48 top-[20%] h-[500px] w-[500px] rounded-full bg-white/[0.05] blur-[150px]" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />

        {/* Top and bottom lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 xl:gap-24">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            {/* Image glow */}
            <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-blue-600/10 blur-[50px]" />

            <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#080b11] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-[32px] sm:p-3">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] sm:rounded-[25px]">
                <img
                  src={machineImg}
                  alt="Automatic car wash machine"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />

                {/* Image overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

                <div className="absolute inset-0 bg-blue-600/[0.04]" />

                {/* Top badge */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-white shadow-lg backdrop-blur-xl sm:left-5 sm:top-5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]">
                    Automated Technology
                  </span>
                </div>

                {/* Bottom status card */}
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl sm:inset-x-5 sm:bottom-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white sm:text-base">
                        Fast. Safe. Consistent.
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Precision cleaning for every vehicle
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/15 text-blue-200">
                      <Sparkles size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Border highlight */}
              <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
            </div>

            {/* Floating feature */}
            <div className="absolute -bottom-6 right-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0f17]/90 px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex lg:-right-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                <Clock3 size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Quick Wash</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Reduced waiting time
                </p>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="order-1 lg:order-2">
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-blue-400 to-transparent" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-300 sm:text-xs">
                Next Generation Car Care
              </span>
            </div>

            {/* Heading */}
            <h2 className="max-w-xl text-3xl font-bold leading-[1.06] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
              Advanced automatic
              <span className="mt-2 block bg-gradient-to-r from-[#74b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent">
                car washing.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
              Experience a faster and more consistent clean with our modern
              automatic car wash system. Precision water jets and advanced
              brushes remove dirt safely while protecting your vehicle&apos;s
              finish.
            </p>

            {/* Features grid */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Gauge,
                  title: "High-pressure cleaning",
                  description: "Powerful and precise washing",
                },
                {
                  icon: ShieldCheck,
                  title: "Paint-safe process",
                  description: "Designed for careful cleaning",
                },
                {
                  icon: Droplets,
                  title: "Efficient water usage",
                  description: "Optimised cleaning technology",
                },
                {
                  icon: BadgeCheck,
                  title: "Consistent finish",
                  description: "Reliable results every time",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/[0.07]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300 transition-all duration-300 group-hover:bg-blue-500/15">
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom statistics */}
        <div className="mt-20 grid overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm sm:grid-cols-3 lg:mt-28">
          <div className="border-b border-white/[0.08] p-6 sm:border-b-0 sm:border-r sm:p-7">
            <p className="text-2xl font-bold text-white sm:text-3xl">360°</p>
            <p className="mt-2 text-sm font-medium text-gray-300">
              Complete vehicle coverage
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Carefully cleans every visible angle
            </p>
          </div>

          <div className="border-b border-white/[0.08] p-6 sm:border-b-0 sm:border-r sm:p-7">
            <p className="text-2xl font-bold text-white sm:text-3xl">Fast</p>
            <p className="mt-2 text-sm font-medium text-gray-300">
              Efficient cleaning cycle
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Less waiting, dependable results
            </p>
          </div>

          <div className="p-6 sm:p-7">
            <p className="text-2xl font-bold text-white sm:text-3xl">Safe</p>
            <p className="mt-2 text-sm font-medium text-gray-300">
              Vehicle-friendly process
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Quality equipment and products
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}