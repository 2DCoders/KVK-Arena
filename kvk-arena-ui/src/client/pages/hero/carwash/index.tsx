import hero_bg from "@/assets/hero/carwash1.png";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";

export default function CarwashHero() {
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#02040a]">
      {/* Background image */}
      <div
        className="absolute inset-0 scale-[1.02] bg-cover bg-[68%_center] bg-no-repeat sm:bg-[64%_center] lg:bg-center"
        style={{
          backgroundImage: `url(${hero_bg})`,
        }}
      />

      {/* Background darkness */}
      <div className="absolute inset-0 bg-black/25 sm:bg-black/10" />

      {/* Main horizontal overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#01030a_0%,rgba(1,3,10,0.98)_23%,rgba(2,8,20,0.84)_52%,rgba(0,20,55,0.34)_78%,rgba(0,8,25,0.12)_100%)] max-lg:bg-[linear-gradient(90deg,#01030a_0%,rgba(1,4,12,0.94)_42%,rgba(0,18,48,0.44)_100%)] max-sm:bg-[linear-gradient(180deg,rgba(1,4,12,0.72)_0%,rgba(0,12,35,0.62)_48%,#02040a_100%)]" />

      {/* Vertical overlay */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_28%,rgba(0,8,25,0.18)_65%,#02040a_100%)]" /> */}

      {/* Left-side electric blue atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main soft blue glow */}
        <div className="absolute -left-48 top-[16%] h-[520px] w-[560px] rounded-full bg-blue-600/10 blur-[140px]" />

        {/* Smaller cyan highlight */}
        <div className="absolute -left-20 top-[38%] h-[260px] w-[360px] rounded-full bg-cyan-400/0 blur-[110px]" />

        {/* Subtle vertical electric beam */}
        <div className="absolute left-[5%] top-[16%] hidden h-[58%] w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent shadow-[0_0_16px_rgba(59,130,246,0.45)] sm:block" />

        {/* Minimal diagonal energy lines */}
        <div className="absolute -left-[8%] top-[32%] h-px w-[46%] -rotate-[9deg] bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

        <div className="absolute -left-[4%] top-[46%] h-px w-[35%] rotate-[7deg] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

        {/* Small controlled light point */}
        <span className="absolute left-[7%] top-[30%] hidden h-1 w-1 rounded-full bg-blue-200 shadow-[0_0_14px_4px_rgba(96,165,250,0.45)] sm:block" />
      </div>

      {/* Soft bottom glow */}
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[400px] w-[80%] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-5 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28 lg:px-12 lg:pb-10 lg:pt-32">
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[660px] pb-12 sm:pb-16 lg:-translate-y-3 lg:pb-8">
            {/* Heading */}
            <h1 className="max-w-[650px] text-[2.9rem] font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-[4rem] lg:text-[4.8rem] xl:text-[4rem]">
              Elevate every
              <span className="relative mt-2 block w-fit">
                <span className="bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.35)]">
                  drive.
                </span>

                <span className="absolute -bottom-2 left-1 h-[2px] w-20 bg-gradient-to-r from-cyan-300 via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] sm:w-28" />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[570px] text-sm leading-6 text-gray-300 sm:mt-9 sm:text-lg sm:leading-8">
              Precision washing, professional detailing and lasting protection
              designed to keep your vehicle looking its absolute best.
            </p>

            {/* Features */}
            <div className="mt-6 grid max-w-[600px] grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-3 sm:gap-4">
              {[
                "Professional detailing",
                "Premium products",
                "Careful finishing",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-gray-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/15 text-blue-200 shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                    <Check size={11} strokeWidth={3} />
                  </span>

                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={scrollToServices}
                className="group inline-flex cursor-pointer h-12 items-center justify-center gap-3 rounded-full border border-blue-300/20 bg-gradient-to-r from-[#0757d4] to-[#1688ff] px-6 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(0,102,255,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,132,255,0.48)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Explore
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex cursor-pointer h-12 items-center justify-center rounded-full border border-blue-300/20 bg-blue-500/[0.07] px-6 text-sm font-semibold text-gray-200 backdrop-blur-md transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/[0.12] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>

        {/* Bottom information panel */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-300/15 bg-[#020711]/60 p-4 shadow-[0_18px_60px_rgba(0,76,255,0.12)] backdrop-blur-xl sm:p-5 lg:max-w-[900px] lg:rounded-3xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0">
            <div className="flex items-center gap-3 rounded-xl p-2 sm:rounded-none sm:border-r sm:border-blue-300/10 sm:px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/20 bg-blue-500/15 text-blue-200 shadow-[0_0_18px_rgba(37,99,235,0.18)]">
                <Sparkles size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white sm:text-[15px]">
                  Premium Finish
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-500 sm:text-[11px]">
                  Detailed by hand
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-2 sm:rounded-none sm:border-r sm:border-blue-300/10 sm:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/15 bg-blue-500/[0.08] text-blue-100">
                <ShieldCheck size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white sm:text-[15px]">
                  Trusted Protection
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-500 sm:text-[11px]">
                  Quality products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-2 sm:rounded-none sm:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/15 bg-blue-500/[0.08] text-blue-100">
                <Check size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white sm:text-[15px]">
                  Careful Service
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-500 sm:text-[11px]">
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
