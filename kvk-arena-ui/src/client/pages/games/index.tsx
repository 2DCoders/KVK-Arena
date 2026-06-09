import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import spiderman from "@/assets/spiderman.png";

const games = [
  {
    id: 1,
    title: "Marvel’s Spider-Man: Miles Morales",
    genre: "PC Game",
    description:
      "Miles Morales embraces his role as Spider-Man when a threat puts his home and city in danger.",
    characters: Array(5).fill(spiderman),
  },
  {
    id: 2,
    title: "Marvel’s Spider-Man: Miles Morales",
    genre: "PC Game",
    description:
      "Miles Morales embraces his role as Spider-Man when a threat puts his home and city in danger.",
    characters: Array(5).fill(spiderman),
  },
];

export default function Games() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeCharacter, setActiveCharacter] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#050812] py-28">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(220,38,38,0.15),transparent_40%)]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {games.map((game, gameIndex) => (
            <SwiperSlide key={game.id}>
              <div className="relative min-h-[700px] flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Huge Background Number */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[180px] lg:text-[260px] font-black text-white/[0.03] select-none pointer-events-none">
                  0{gameIndex + 1}
                </div>

                {/* Left Content */}
                <div className="relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-400">
                      {game.genre}
                    </span>
                  </div>

                  <h2 className="mt-8 text-5xl lg:text-6xl font-black text-white leading-tight uppercase">
                    {game.title}
                  </h2>

                  <p className="mt-6 text-lg leading-relaxed text-gray-400">
                    {game.description}
                  </p>
                </div>

                {/* Character Image */}
                <div className="relative flex flex-1 justify-center">
                  <div className="absolute h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[140px]" />

                  <div className="absolute h-[550px] w-[550px] rounded-full border border-red-500/10" />

                  <div className="absolute h-[650px] w-[650px] rounded-full border border-white/[0.04]" />

                  <img
                    src={game.characters[activeCharacter]}
                    alt={game.title}
                    className="relative z-10 h-[550px] lg:h-[700px] object-contain drop-shadow-[0_25px_80px_rgba(239,68,68,0.55)] transition-all duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-red-500" />
          </div>

          <div className="ml-8 flex gap-3">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}