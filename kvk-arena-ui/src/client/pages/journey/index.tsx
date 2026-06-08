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
    <section className="relative overflow-hidden bg-[#080604] py-32">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0906] via-[#080604] to-black" />

      {/* Top Gold Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-amber-400/15 blur-[180px]" />

      {/* Center Golden Glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-[180px]" />

      {/* Left Brown Glow */}
      <div className="absolute left-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-orange-900/15 blur-[180px]" />

      {/* Right Brown Glow */}
      <div className="absolute right-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-amber-900/15 blur-[180px]" />

      {/* Gold Spotlight */}
      <div className="absolute left-1/2 top-[20%] h-[250px] w-[250px] -translate-x-1/2 rounded-full bg-yellow-400/20 blur-[120px]" />

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-6">
        {/* Center Content */}
        <div className="relative z-20 mx-auto mb-20 max-w-4xl text-center" data-aos="fade-up">

          <h2 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
            From Your First Match
            <br />
            To Becoming A Champion
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Experience premium badminton courts, professional coaching,
            tournaments, and a thriving community designed to elevate your game.
          </p>

        <a href="#bookings" className="text-slate-900">
          <button className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition-all hover:scale-105">
            Start Your Journey
            <ArrowRight size={18} />
          </button>
          </a>
        </div>

        {/* Curved Cards */}
        <div className="relative flex h-[250px] items-center justify-center [perspective:2000px]" data-aos="fade-up">
          {cards.map((card, index) => {
            const rotation = (index - (cards.length - 1) / 2) * 14;
            const translateX = (index - (cards.length - 1) / 2) * 180;

            return (
              <div
                key={card.title}
                className="group absolute cursor-pointer transition-all duration-500 hover:z-50 hover:scale-110"
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
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

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
      </div>
    </section>
  );
}
