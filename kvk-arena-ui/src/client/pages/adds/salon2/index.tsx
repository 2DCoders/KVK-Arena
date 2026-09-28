import { Check, Clock3, Footprints, Hand, Sparkles, Star } from "lucide-react";

const MANICURE_IMAGE =
  "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80";

const PEDICURE_IMAGE =
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80";

export default function SalonAdd2() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0b0510,#170b23,#0b0510)] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[110px]" />

      {/* Fine grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto grid max-w-[1250px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* =========================================
            IMAGE COLLAGE
        ========================================= */}
        <div className="relative order-1 mx-auto w-full max-w-[420px] lg:order-1 lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-purple-300/15 shadow-[0_35px_90px_rgba(88,28,135,0.45)] sm:rounded-[2.5rem]">
            <img
              src={PEDICURE_IMAGE}
              alt="Relaxing pedicure treatment with foot soak"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0510]/80 via-transparent to-transparent" />
          </div>

          {/* Overlapping manicure image */}
          <div className="absolute -right-3 -top-6 h-[130px] w-[130px] overflow-hidden rounded-2xl border-4 border-[#0b0510] shadow-[0_25px_60px_rgba(0,0,0,0.5)] sm:-right-6 sm:-top-8 sm:h-[170px] sm:w-[170px] sm:rounded-3xl">
            <img
              src={MANICURE_IMAGE}
              alt="Precise manicure with nail polish finish"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Floating trust badge */}
          <div className="absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-2xl border border-purple-300/20 bg-[#160c22]/95 px-4 py-3 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md sm:-bottom-6 sm:-left-6 sm:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white sm:h-10 sm:w-10">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-purple-300 sm:text-[10px]">
                Loved By Regulars
              </p>
              <p className="text-sm font-black text-white sm:text-base">500+ Happy Clients</p>
            </div>
          </div>
        </div>

        {/* =========================================
            CONTENT
        ========================================= */}
        <div className="order-2 text-center lg:order-2 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/25 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e9d5ff] backdrop-blur-sm sm:text-xs">
            <Star size={12} className="fill-[#c084fc] text-[#c084fc]" />
            Hand &amp; Foot Care
          </div>

          <h2 className="mt-6 text-[2.4rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[3.4rem] lg:text-[3.8rem]">
            Soft Hands.
            <br />
            <span className="bg-gradient-to-r from-[#f5eaff] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
              Happy Feet.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-purple-100/70 sm:text-base lg:mx-0">
            Give your hands and feet the attention they deserve. Our manicure
            and pedicure rituals combine gentle care, precise shaping and a
            flawless polish finish — the perfect reset between busy days.
          </p>

          {/* Feature chips */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-[#c084fc]">
                <Hand size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Manicure</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-purple-200/70">
                  <Clock3 size={12} />
                  <span>45 min session</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-[#c084fc]">
                <Footprints size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Pedicure</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-purple-200/70">
                  <Clock3 size={12} />
                  <span>60 min session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust points */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-100/70">
              <Check size={14} className="text-[#c084fc]" />
              Sterilised tools, every visit
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-100/70">
              <Check size={14} className="text-[#c084fc]" />
              Premium polish brands
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
