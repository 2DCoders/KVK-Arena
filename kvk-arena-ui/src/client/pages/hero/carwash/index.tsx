import hero_bg from "@/assets/hero/carwash_bg.png";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function CarwashHero() {
  const scrollToServices = () => {
    document
      .getElementById("services")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-[62%_center] bg-no-repeat lg:bg-center"
        style={{
          backgroundImage: `url(${hero_bg})`,
        }}
      />

      {/* Main overlays */}
      <div className="absolute inset-0 bg-black/5" />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.96)_20%,rgba(0,0,0,0.72)_46%,rgba(0,0,0,0.18)_74%,rgba(0,0,0,0.08)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,transparent_32%,rgba(0,0,0,0.18)_68%,#000_100%)]" />

      {/* Subtle silver glow */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-26 sm:px-8 lg:px-12 lg:pb-12 lg:pt-30">
        <div className="flex flex-1 items-center">
          <div className="max-w-[650px] pb-8 lg:-translate-y-2">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-gray-100 to-gray-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gray-300">
                Premium Auto Care
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[620px] text-[3rem] font-bold leading-[0.98] tracking-[-0.045em] text-[#0046c9] sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
              Elevate every
              <span className="mt-2 block bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                drive.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[570px] text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
              Precision washing, professional detailing and lasting protection
              designed to keep your vehicle looking its absolute best.
            </p>

            {/* Feature row */}
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {[
                "Professional detailing",
                "Premium products",
                "Careful finishing",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/[0.06]">
                    <Check size={12} strokeWidth={2.5} />
                  </span>

                  {item}
                </div>
              ))}
            </div>


          </div>
        </div>

        {/* Bottom information panel */}
        <div className="border-t border-white/10 pt-6">
          <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0">
            <div className="flex items-center gap-4 sm:border-r sm:border-white/10 sm:pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-200">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="font-semibold text-white">Premium Finish</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Detailed by hand
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-r sm:border-white/10 sm:pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-200">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="font-semibold text-white">Trusted Protection</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Quality products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-200">
                <Check size={18} />
              </div>

              <div>
                <p className="font-semibold text-white">Careful Service</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Attention to detail
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}