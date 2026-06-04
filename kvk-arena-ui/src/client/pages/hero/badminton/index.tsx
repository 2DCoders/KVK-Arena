import hero_bg from "@/assets/hero/badminton_hero.png";

export default function BadmintonHero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[90vh] flex items-center py-26">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero_bg})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          {/* Small Label */}
          <p className="text-white/80 text-sm md:text-base mb-4 tracking-wide uppercase pt-5">
            KVK Arena Badminton Club
          </p>

          {/* Main Heading */}
          <h1 className="text-white font-extrabold uppercase leading-none">
            <span className="block text-5xl sm:text-6xl lg:text-7xl">
              Train
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl">
              Play
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl">
              Compete
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-white/90 text-base md:text-lg">
            Join passionate badminton players, improve your skills with expert
            coaching, and compete on professional courts designed for every
            level.
          </p>
        </div>

        {/* Bottom Cards */}
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          {/* Countdown Card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-white/70 text-sm">Days</p>
              </div>

              <div>
                <p className="text-3xl font-bold text-white">08</p>
                <p className="text-white/70 text-sm">Hours</p>
              </div>

              <div>
                <p className="text-3xl font-bold text-white">45</p>
                <p className="text-white/70 text-sm">Min</p>
              </div>
            </div>
          </div>

          {/* Event Card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-lime-400 flex items-center justify-center">
              🏸
            </div>

            <div>
              <h3 className="text-white font-semibold">
                Summer Badminton Championship
              </h3>
              <p className="text-white/70 text-sm">
                August 15th, 2026
              </p>
              <p className="text-white/60 text-sm">
                KVK Arena Indoor Courts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}