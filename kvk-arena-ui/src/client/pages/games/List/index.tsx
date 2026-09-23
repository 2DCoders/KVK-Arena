import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameLibraryModal from "@/components/games-list";
import { getGames } from "@/services/games-api";

interface Game {
  id: string;
  gamingCategoryId: string;
  gamingCategoryName: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string;
  image: string;
}

export default function GamesList() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [showGames, setShowGames] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getGames();

        // Only show active games
        const activeGames = gamesData
          .filter((game: Game) => game.isActive)
          .slice(0, 10);

        setGames(activeGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setGames([]);
      }
    };

    fetchGames();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -900 : 900,
      behavior: "smooth",
    });
  };

  // Convert Base64 image to usable image URL
  const getImageUrl = (image: string) => {
    if (!image) return "";

    // Already a complete data URL
    if (image.startsWith("data:image")) {
      return image;
    }

    // Raw Base64
    return `data:image/jpeg;base64,${image}`;
  };

  return (
    <section className="relative bg-[linear-gradient(180deg,#ffffff,#f8fafc,#eef2ff)] py-20">
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
          {games.map((game) => {
            const category = game.gamingCategoryName || "Gaming";

            return (
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
                      src={getImageUrl(game.image)}
                      alt={game.name}
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

                  {/* Category Badge */}
                  <span
                    className={`
                      absolute left-6 top-6
                      rounded-full
                      px-3 py-1
                      text-xs font-bold text-white
                      ${category.toLowerCase().includes("pc")
                        ? "bg-blue-600"
                        : "bg-purple-600"
                      }
                    `}
                  >
                    {category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">

                  {/* Game Name */}
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {game.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {game.description}
                  </p>

                  {/* Category Tag */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-3 py-1
                        text-xs
                        font-medium
                        text-slate-700
                      "
                    >
                      {category}
                    </span>
                  </div>

                  {/* Bottom Row */}
                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      border-t
                      border-slate-100
                      pt-4
                    "
                  >
                    <div>
                      <p className="text-xs text-slate-400">
                        Category
                      </p>

                      <p className="font-semibold text-slate-900">
                        {category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Status
                      </p>

                      <p className="font-semibold text-green-600">
                        Available
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* No Games */}
        {games.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            No games available.
          </div>
        )}
      </div>
    </section>
  );
}