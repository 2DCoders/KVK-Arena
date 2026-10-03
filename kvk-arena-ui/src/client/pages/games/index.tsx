import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import spiderman from "@/assets/spiderman.png";
import spidermanBg from "@/assets/spiderman_bg.jpeg";
import hogwarts from "@/assets/hogwarts.png";
import hogwartsBg from "@/assets/hogwarts_bg.jpg";
import cod from "@/assets/cod.png";
import codBg from "@/assets/cod_bg.jpg";
import lastofus from "@/assets/lastofus.png";
import lastofusBg from "@/assets/lastofus_bg.jpg";
import uncharted from "@/assets/uncharted.png";
import unchartedBg from "@/assets/uncharted_bg.jpg";

const games = [
  {
    id: 1,
    title: "Marvel’s Spider-Man: Miles Morales",
    genre: "PC Game",
    description:
      "Miles Morales embraces his role as Spider-Man when a threat puts his home and city in danger.",
    background: spidermanBg,
    character: spiderman,
    glowColor: "rgba(239,68,68,0.25)", // Red
  },
  {
    id: 2,
    title: "Hogwarts Legacy",
    genre: "PC Game",
    description:
      "Hogwarts Legacy is an open-world action RPG where you play a Hogwarts student in the 1800s.",
    background: hogwartsBg,
    character: hogwarts,
    glowColor: "rgba(96,165,250,0.25)", // Light Blue
  },
  {
    id: 3,
    title: "Call of Duty: Black Ops 7",
    genre: "PS5 Game",
    description:
      "Continue the intense, high-stakes action of the Call of Duty franchise.",
    background: codBg,
    character: cod,
    glowColor: "rgba(251,146,60,0.25)", // Orange
  },
  {
    id: 4,
    title: "The Last of Us Part II",
    genre: "PS5 Game",
    description: "Joel and Ellie must navigate a post-apocalyptic world.",
    background: lastofusBg,
    character: lastofus,
    glowColor: "rgba(74,222,128,0.25)", // Green
  },
  {
    id: 5,
    title: "Uncharted 4: A Thief's End",
    genre: "PS5 Game",
    description: "Join Nathan Drake on his final adventure.",
    background: unchartedBg,
    character: uncharted,
    glowColor: "rgba(192,132,252,0.25)", // Purple
  },
];

export default function Games() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="relative overflow-hidden bg-[#050812] py-4 sm:py-5">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(220,38,38,0.15),transparent_60%)]" />

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
          {games.map((game) => (
            <SwiperSlide key={game.id}>
              <div className="relative min-h-[620px] overflow-hidden rounded-[24px] sm:min-h-[700px] sm:rounded-[40px] lg:min-h-[750px]">
                {/* Game Background */}
                <img
                  src={game.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Left Side Darker */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#050812]/75 to-transparent" />

                {/* Content */}
                <div className="relative z-10 container mx-auto flex min-h-[620px] flex-col items-center justify-center gap-6 px-5 py-8 sm:min-h-[700px] sm:px-8 lg:min-h-[750px] lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-16 lg:py-0">
                  {/* Left Content */}
                  <div className="max-w-xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 sm:px-5 sm:py-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs font-medium text-red-400 sm:text-sm">
                        {game.genre}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-black text-white uppercase sm:mt-8 sm:text-5xl lg:text-7xl">
                      {game.title}
                    </h2>

                    <p className="mt-4 text-sm text-gray-300 line-clamp-3 sm:mt-6 sm:text-lg sm:line-clamp-none">
                      {game.description}
                    </p>

                    {/* Game Info */}
                    <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3 lg:justify-start">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                        Action
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                        Multiplayer
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                        4K Support
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-5 flex justify-center gap-6 sm:mt-8 sm:gap-10 lg:justify-start">
                      <div>
                        <p className="text-xl font-bold text-white sm:text-3xl">4.9</p>
                        <p className="text-xs text-gray-400 sm:text-sm">Rating</p>
                      </div>

                      <div>
                        <p className="text-xl font-bold text-white sm:text-3xl">50+</p>
                        <p className="text-xs text-gray-400 sm:text-sm">Hours</p>
                      </div>

                      <div>
                        <p className="text-xl font-bold text-white sm:text-3xl">PS5</p>
                        <p className="text-xs text-gray-400 sm:text-sm">Platform</p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center lg:justify-start">

                      <a href="#bookings" className="w-full sm:w-auto">
                        <button className="w-full rounded-xl cursor-pointer bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 sm:w-auto sm:px-8 sm:py-4 sm:text-base">
                          Book Now
                        </button>
                      </a>

                      <button className="w-full rounded-xl cursor-pointer border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/30 sm:w-auto sm:px-8 sm:py-4 sm:text-base">
                        View More
                      </button>
                    </div>
                  </div>

                  {/* Character */}
                  <div className="relative hidden sm:block">
                    <div
                      className="absolute inset-0 scale-110 rounded-full"
                      style={{
                        backgroundColor: game.glowColor,
                        filter: "blur(60px)",
                      }}
                    />

                    <img
                      src={game.character}
                      alt={game.title}
                      className="
                        relative z-10
                        h-[360px]
                        object-contain
                        drop-shadow-[0_20px_60px_rgba(255,255,255,0.15)]
                        sm:h-[460px]
                        lg:h-[700px]
                    "
                    />
                  </div>
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
              className="flex h-12 w-12 items-center cursor-pointer justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-12 w-12 items-center cursor-pointer justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
