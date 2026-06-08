import hero_bg from "@/assets/hero/badminton_hero1.png";
import { Badge } from "lucide-react";

export default function BadmintonHero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[85vh] flex items-center py-25">
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
            
          </p>

          {/* Main Heading */}
          <h1 className="text-white font-extrabold uppercase leading-none">
            <span className="block text-5xl sm:text-6xl lg:text-6xl">
              Train
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-6xl text-[#D98B4D]">
              Play
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-6xl">
              Compete
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-white/90 text-base md:text-lg">
            Book your court, gather your team, and enjoy fast-paced badminton matches on well-maintained courts built for recreational and competitive play.
          </p>
        </div>

        {/* Bottom Cards */}
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          {/* Countdown Card */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-5">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-3xl">🏸</p>
                  <p className="font-semibold text-white">Pro Courts</p>
                  <p className="text-white/70 text-sm">Premium playing surface</p>
                </div>

                <div>
                  <p className="text-3xl">📅</p>
                  <p className="font-semibold text-white">Easy Booking</p>
                  <p className="text-white/70 text-sm">Reserve in seconds</p>
                </div>

                <div>
                  <p className="text-3xl">⚡</p>
                  <p className="font-semibold text-white">Instant Confirm</p>
                  <p className="text-white/70 text-sm">Real-time availability</p>
                </div>
              </div>
          </div>

          {/* Event Card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-[#A65A2A] flex items-center justify-center">
              <Badge className="h-7 w-7 text-white" />
            </div>

            <div>
              <h3 className="text-white font-semibold">
                KVK Arena Badminton Courts
              </h3>
              <p className="text-white/70 text-sm">
                Everyday 9 AM - 10 PM
              </p>
              <p className="text-white/60 text-sm">
                Book your court now
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}