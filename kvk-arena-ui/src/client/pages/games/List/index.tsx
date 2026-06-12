import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import thumbnail from "@/assets/spiderman_bg.jpeg";
import GameLibraryModal from "@/components/games-list";

const games = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: `Game ${i + 1}`,
  platform: i % 2 === 0 ? "PC" : "PS5",
  image: thumbnail,
  tags: ["Action", "Multiplayer"],
}));

export default function GamesList() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showGames, setShowGames] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -900 : 900,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-[linear-gradient(180deg,#ffffff,#f8fafc,#eef2ff)] py-20">
      {" "}
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <div
          className="mb-8 flex items-start justify-between"
          data-aos="fade-up"
        >
          {/* Left */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              Explore
            </p>

            <h2 className="mt-2 text-4xl font-black text-slate-900">
              Popular Games
            </h2>

            <p className="mt-2 text-slate-500">
              Discover trending PC and PlayStation titles.
            </p>
          </div>

          <GameLibraryModal
            isOpen={showGames}
            onClose={() => setShowGames(false)}
          />

          {/* Right */}
          <div className="flex flex-col items-end gap-5">
            {/* Align with Explore */}
            <button
            onClick={() => setShowGames(true)}
              className="
        text-red-500
        font-semibold
        hover:text-red-600
        hover:underline
        transition
        cursor-pointer
      "
            >
              View More Games
            </button>

            {/* Align with Popular Games */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll("left")}
                className="
          flex h-12 w-12 items-center justify-center
          rounded-full
          border border-slate-200
          bg-white
          shadow-lg
          transition-all
          hover:-translate-y-1
          hover:border-red-500
          hover:text-red-600
          cursor-pointer
        "
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => scroll("right")}
                className="
          flex h-12 w-12 items-center justify-center
          rounded-full
          border border-slate-200
          bg-white
          shadow-lg
          transition-all
          hover:-translate-y-1
          hover:border-red-500
          hover:text-red-600
          cursor-pointer
        "
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="
            flex gap-5 overflow-x-auto scroll-smooth
            scrollbar-hide
            pb-10
          "
        >
          {games.map((game) => (
            <div
              key={game.id}
              data-aos="fade-up"
              className="
                group
                min-w-[280px]
                max-w-[280px]
                overflow-hidden
                rounded-[24px]
                bg-white
                border border-slate-200
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)]
            "
            >
              {/* Thumbnail */}
              <div className="relative p-3 pb-0">
                <div className="overflow-hidden rounded-[18px]">
                  <img
                    src={game.image}
                    alt=""
                    className="
                    aspect-[3/2]
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                    "
                  />
                </div>

                {/* Platform Badge */}
                <span
                  className={`
                    absolute left-6 top-6
                    rounded-full
                    px-3 py-1
                    text-xs font-bold text-white
                    ${game.platform === "PC" ? "bg-blue-600" : "bg-purple-600"}
                `}
                >
                  {game.platform}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                  {game.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Available for gaming sessions
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-full
                        bg-slate-100
                        px-3 py-1
                        text-xs
                        font-medium
                        text-slate-700
                    "
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom Row */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">Platform</p>

                    <p className="font-semibold text-slate-900">
                      {game.platform}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Rating</p>

                    <p className="font-semibold text-amber-500">★ 4.9</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
