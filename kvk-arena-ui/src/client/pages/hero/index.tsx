import hero_bg from "@/assets/hero/hero_bg1.png";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 rounded-lg"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />
      <div aria-hidden="true" className="absolute inset-0 rounded-lg bg-slate-950/25" />
      <div aria-hidden="true" className="absolute inset-0 rounded-lg bg-linear-to-b from-slate-950/80 via-slate-950/65 to-slate-950/85" />

      <div className="relative z-10 mx-auto mt-5 flex max-w-7xl flex-col items-center gap-8 px-4 text-center lg:px-8">
        <div className="hero-fade-up max-w-4xl">
          <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            One arena for
            <span className="block bg-linear-to-r from-[#8FC0FF] via-white to-[#8FC0FF] bg-clip-text text-transparent">
              movement, play, care.
            </span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Explore four connected experiences in a modern light-space design: Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move easier, and keep your day flowing in one place.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(41,107,225,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f58be]">
              Sign Up Now
            </button>
            <button className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/16">
              Sign In
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(26px);
          animation: hero-fade-up 700ms ease forwards;
        }

        @keyframes hero-fade-up {
          0% {
            opacity: 0;
            transform: translateY(26px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}