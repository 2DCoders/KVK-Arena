import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCardSkeleton from "@/components/games-list/game-card-skeleton";
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
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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
    <section className="relative bg-[linear-gradient(180deg,#ffffff,#f8fafc,#eef2ff)] py-12 sm:py-16 lg:py-20">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />

      <div className="container mx-auto px-4 lg:px-8 relative">

        {/* Header */}
        <div
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-0"
          data-aos="fade-up"
        >
          {/* Left */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 sm:text-sm">
              Explore
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
              Popular Games
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Discover trending PC and PlayStation titles.
            </p>
          </div>

          <GameLibraryModal
            isOpen={showGames}
            onClose={() => setShowGames(false)}
          />

          {/* Right */}
          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-5">

            <button
              onClick={() => setShowGames(true)}
              className="
                text-sm
                text-red-500
                font-semibold
                hover:text-red-600
                hover:underline
                transition
                cursor-pointer
                sm:text-base
              "
            >
              View More Games
            </button>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => scroll("left")}
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-white
                  shadow-lg
                  transition-all
                  hover:-translate-y-1
                  hover:border-red-500
                  hover:text-red-600
                  cursor-pointer
                  sm:h-12 sm:w-12
                "
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => scroll("right")}
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-white
                  shadow-lg
                  transition-all
                  hover:-translate-y-1
                  hover:border-red-500
                  hover:text-red-600
                  cursor-pointer
                  sm:h-12 sm:w-12
                "
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div
          aria-busy={loading}
          ref={scrollRef}
          className="
            flex gap-3 overflow-x-auto scroll-smooth
            scrollbar-hide
            pb-10
            sm:gap-5
          "
        >
          {loading && <span role="status" className="sr-only">Loading games...</span>}
          {loading && Array.from({ length: 6 }, (_, index) => <GameCardSkeleton key={index} />)}
          {!loading && games.map((game) => {
            const category = game.gamingCategoryName || "Gaming";

            return (
              <div
                key={game.id}
                data-aos="fade-up"
                className="
                  group
                  min-w-[180px]
                  max-w-[180px]
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  border border-slate-200
                  shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)]
                  sm:min-w-[280px]
                  sm:max-w-[280px]
                  sm:rounded-[24px]
                "
              >
                {/* Thumbnail */}
                <div className="relative p-2 pb-0 sm:p-3">
                  <div className="overflow-hidden rounded-xl sm:rounded-[18px]">
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
                      absolute left-4 top-4
                      rounded-full
                      px-2 py-0.5
                      text-[10px] font-bold text-white
                      sm:left-6 sm:top-6 sm:px-3 sm:py-1 sm:text-xs
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
                <div className="p-3 sm:p-5">

                  {/* Game Name */}
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 sm:text-lg">
                    {game.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 sm:mt-2 sm:text-sm">
                    {game.description}
                  </p>

                  {/* Category Tag */}
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2 py-0.5
                        text-[10px]
                        font-medium
                        text-slate-700
                        sm:px-3 sm:py-1 sm:text-xs
                      "
                    >
                      {category}
                    </span>
                  </div>

                  {/* Bottom Row */}
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      border-t
                      border-slate-100
                      pt-3
                      sm:mt-5
                      sm:pt-4
                    "
                  >
                    <div>
                      <p className="text-[10px] text-slate-400 sm:text-xs">
                        Category
                      </p>

                      <p className="text-xs font-semibold text-slate-900 sm:text-base">
                        {category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 sm:text-xs">
                        Status
                      </p>

                      <p className="text-xs font-semibold text-green-600 sm:text-base">
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