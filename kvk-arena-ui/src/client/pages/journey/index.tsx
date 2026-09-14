import image1 from "@/assets/j1.png";
import image2 from "@/assets/j2.png";
import image3 from "@/assets/j3.png";
import image4 from "@/assets/j4.png";
import image5 from "@/assets/j5.png";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Join With Us",
    image: image1,
  },
  {
    title: "Book Court",
    image: image2,
  },
  {
    title: "Train Hard",
    image: image3,
  },
  {
    title: "Play Matches",
    image: image4,
  },
  {
    title: "Become Champion",
    image: image5,
  },
];

export default function Journey() {
  return (
    <section className="relative overflow-hidden bg-[#080604] py-16 sm:py-20 md:py-24 lg:py-32">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0906] via-[#080604] to-black" />

      {/* Top Gold Glow */}
      <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-400/15 blur-[120px] sm:h-[400px] sm:w-[750px] sm:blur-[150px] lg:h-[500px] lg:w-[900px] lg:blur-[180px]" />

      {/* Center Golden Glow */}
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-[120px] sm:h-[450px] sm:w-[450px] lg:h-[600px] lg:w-[600px] lg:blur-[180px]" />

      {/* Left Brown Glow */}
      <div className="absolute left-0 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full bg-orange-900/15 blur-[120px] sm:h-[350px] sm:w-[350px] lg:h-[450px] lg:w-[450px] lg:blur-[180px]" />

      {/* Right Brown Glow */}
      <div className="absolute right-0 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full bg-amber-900/15 blur-[120px] sm:h-[350px] sm:w-[350px] lg:h-[450px] lg:w-[450px] lg:blur-[180px]" />

      {/* Gold Spotlight */}
      <div className="absolute left-1/2 top-[15%] h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-yellow-400/20 blur-[90px] sm:h-[220px] sm:w-[220px] lg:top-[20%] lg:h-[250px] lg:w-[250px] lg:blur-[120px]" />

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Center Content */}
        <div
          className="relative z-20 mx-auto mb-12 max-w-4xl text-center sm:mb-16 lg:mb-20"
          data-aos="fade-up"
        >
          <h2 className="mx-auto max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            From Your First Match
            <br />
            To Becoming A Champion
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:mt-6 sm:text-base md:text-lg">
            Experience premium badminton courts, professional coaching,
            tournaments, and a thriving community designed to elevate your
            game.
          </p>

          <a
            href="#bookings"
            className="mx-auto mt-6 inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:scale-105 sm:mt-8 sm:w-auto sm:px-8 sm:py-4"
          >
            Start Your Journey
            <ArrowRight size={18} />
          </a>
        </div>

        {/* =========================================================
            MOBILE / TABLET CARDS
            Horizontal scroll instead of curved absolute positioning
           ========================================================= */}
        <div
          className="relative z-20 block lg:hidden"
          data-aos="fade-up"
        >
          <div
            className="
              flex
              snap-x
              snap-mandatory
              gap-4
              overflow-x-auto
              px-1
              pb-6
              pt-2
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              sm:justify-start
            "
          >
            {cards.map((card) => (
              <div
                key={card.title}
                className="
                  group
                  relative
                  w-[165px]
                  min-w-[165px]
                  snap-center
                  cursor-pointer
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  active:scale-[0.98]
                  sm:w-[180px]
                  sm:min-w-[180px]
                "
              >
                <div className="relative h-[235px] w-full overflow-hidden sm:h-[260px]">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition
                      duration-700
                      group-hover:scale-110
                    "
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-semibold leading-tight text-white sm:text-base">
                      {card.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Scroll Hint */}
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-white/30 sm:hidden">
            <span>Swipe to explore</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* =========================================================
            DESKTOP CURVED CARDS
            Original design preserved for lg+
           ========================================================= */}
        <div
          className="
            relative
            hidden
            h-[250px]
            items-center
            justify-center
            [perspective:2000px]
            lg:flex
          "
          data-aos="fade-up"
        >
          {cards.map((card, index) => {
            const rotation =
              (index - (cards.length - 1) / 2) * 14;

            const translateX =
              (index - (cards.length - 1) / 2) * 180;

            return (
              <div
                key={card.title}
                className="
                  group
                  absolute
                  cursor-pointer
                  transition-all
                  duration-500
                  hover:z-50
                  hover:scale-110
                "
                style={{
                  transform: `
                    translateX(${translateX}px)
                    rotateY(${rotation}deg)
                    translateZ(${Math.abs(rotation) * -4}px)
                  `,
                }}
              >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="relative h-[260px] w-[180px] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        group-hover:scale-110
                      "
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-semibold text-white">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacing / mobile fade */}
        <div className="h-2 sm:h-4 lg:h-0" />
      </div>
    </section>
  );
}