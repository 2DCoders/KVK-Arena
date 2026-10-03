import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getGames } from "@/services/games-api";

interface GameLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const ITEMS_PER_PAGE = 20;

export default function GameLibraryModal({
  isOpen,
  onClose,
}: GameLibraryModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Fetch all games when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchGames = async () => {
      try {
        setLoading(true);

        const gamesData = await getGames();

        // Only show active games
        const activeGames = gamesData.filter(
          (game: Game) => game.isActive
        );

        setGames(activeGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [isOpen]);

  // Animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  // Prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [games, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGames.length / ITEMS_PER_PAGE)
  );

  const paginatedGames = filteredGames.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999]">

      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ${
          animate
            ? "bg-black/40 opacity-100"
            : "bg-black/0 opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`
          absolute inset-4
          bg-white
          rounded-3xl
          overflow-hidden
          shadow-2xl
          flex flex-col
          transition-all
          duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            animate
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-[0.98]"
          }
        `}
      >

        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Game Library
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Browse available games
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 cursor-pointer h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 justify-between">

          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Top Info */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">
                  {filteredGames.length} Games Found
                </p>

                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
              </div>

              {/* Games */}
              {paginatedGames.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">

                  {paginatedGames.map((game) => {
                    const category =
                      game.gamingCategoryName || "Gaming";

                    return (
                      <div
                        key={game.id}
                        className="
                          bg-white
                          rounded-3xl
                          border
                          border-gray-100
                          overflow-hidden
                          shadow-sm
                          hover:shadow-xl
                          hover:-translate-y-1
                          transition-all
                          duration-300
                        "
                      >

                        {/* Image */}
                        <div className="p-3 pb-0">
                          <div className="relative">

                            <img
                              src={getImageUrl(game.image)}
                              alt={game.name}
                              className="w-full h-40 object-cover rounded-2xl"
                            />

                            {/* Category */}
                            <span
                              className={`
                                absolute
                                top-3
                                left-3
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                text-white
                                ${
                                  category
                                    .toLowerCase()
                                    .includes("pc")
                                    ? "bg-blue-600"
                                    : "bg-purple-600"
                                }
                              `}
                            >
                              {category}
                            </span>

                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">

                          <h3 className="font-bold text-lg text-gray-900">
                            {game.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {game.description ||
                              "Available for gaming sessions"}
                          </p>

                          {/* Category */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                              {category}
                            </span>
                          </div>

                          {/* Bottom */}
                          <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between">

                            <div>
                              <p className="text-[11px] text-gray-400">
                                Platform
                              </p>

                              <p className="font-semibold text-sm">
                                {category}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[11px] text-gray-400">
                                Status
                              </p>

                              <p className="font-semibold text-sm text-green-600">
                                Available
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}

                </div>
              ) : (
                <div className="py-20 text-center text-gray-500">
                  No games found.
                </div>
              )}

              {/* Pagination */}
              {filteredGames.length > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">

                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="w-9 cursor-pointer h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`
                          w-9
                          h-9
                          cursor-pointer
                          rounded-xl
                          text-sm
                          font-medium
                          transition
                          ${
                            page === num
                              ? "bg-red-500 text-white"
                              : "text-gray-700 hover:bg-white"
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="w-9 h-9 cursor-pointer rounded-xl flex items-center justify-center disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}