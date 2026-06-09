import { useRef, useState } from "react";
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

const games = [
  {
    id: 1,
    title: "Marvel’s Spider-Man: Miles Morales",
    genre: "PC Game",
    description:
      "Miles Morales embraces his role as Spider-Man when a threat puts his home and city in danger.",
    background: spidermanBg,
    character: spiderman,
  },
  {
    id: 2,
    title: "Hogwarts Legacy",
    genre: "PC Game",
    description:
      "**Hogwarts Legacy** is an open-world action RPG where you play a Hogwarts student in the 1800s, uncovering a powerful secret that could change the wizarding world forever.",
    background: hogwartsBg,
    character: hogwarts,
  },
  {
    id: 3,
    title: "Call of Duty: Black Ops 7",
    genre: "PS5 Game",
    description:
      "Continue the intense, high-stakes action of the Call of Duty franchise with the latest installment.",
    background: codBg,
    character: cod,
  },
  {
    id: 4,
    title: "The Last of Us Part II",
    genre: "PS5 Game",
    description:
      "Joel and Ellie must navigate a post-apocalyptic world filled with infected creatures and hostile human factions.",
    background: lastofusBg,
    character: lastofus,
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
  <div className="relative min-h-[750px] overflow-hidden rounded-[40px]">
    
    {/* Game Background */}
    <img
      src={game.background}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/70" />

    {/* Left Side Darker */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#050812]/85 to-transparent" />

    {/* Content */}
    <div className="relative z-10 container mx-auto px-8 lg:px-16 min-h-[750px] flex items-center justify-between">
      
      {/* Left Content */}
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-400">
            {game.genre}
          </span>
        </div>

        <h2 className="mt-8 text-5xl lg:text-7xl font-black text-white uppercase">
          {game.title}
        </h2>

        <p className="mt-6 text-lg text-gray-300">
          {game.description}
        </p>
      </div>

      {/* Character */}
      <div className="relative">
        {/* Red Glow */}
        <div className="absolute inset-0 scale-125 rounded-full bg-red-600/20 blur-[120px]" />

        <img
          src={game.character}
          alt={game.title}
          className="
            relative z-10
            h-[700px]
            object-contain
            drop-shadow-[0_30px_100px_rgba(239,68,68,0.6)]
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