import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface GameLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleImage =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200";

const games = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  title: `Game ${i + 1}`,
  platform: i % 2 === 0 ? "PC" : "PS5",
  image: sampleImage,
  genres: ["Action", "Multiplayer"],
  rating: 4.9,
}));[
    
]

const ITEMS_PER_PAGE = 20;

export default function GameLibraryModal({
  isOpen,
  onClose,
}: GameLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [page, setPage] = useState(1);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [search, platform]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPlatform =
        platform === "all" ? true : game.platform.toLowerCase() === platform;

      return matchesSearch && matchesPlatform;
    });
  }, [search, platform]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGames.length / ITEMS_PER_PAGE),
  );

  const paginatedGames = filteredGames.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ${
          animate ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"
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
            <h2 className="text-xl font-bold text-gray-900">Game Library</h2>

            <p className="text-sm text-gray-500 mt-1">Browse available games</p>
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

          <div className="flex gap-2">
            {["all", "pc", "ps5"].map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`h-10 cursor-pointer px-4 rounded-xl text-sm font-medium transition capitalize ${
                  platform === item
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {filteredGames.length} Games Found
            </p>

            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {paginatedGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="p-3 pb-0">
                  <div className="relative">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-40 object-cover rounded-2xl"
                    />

                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        game.platform === "PC" ? "bg-blue-600" : "bg-purple-600"
                      }`}
                    >
                      {game.platform}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900">
                    {game.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Available for gaming sessions
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {game.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400">Platform</p>

                      <p className="font-semibold text-sm">{game.platform}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">Rating</p>

                      <div className="flex items-center gap-1 text-amber-500 justify-end">
                        <Star size={14} fill="currentColor" />
                        <span className="font-semibold text-sm">
                          {game.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-9 cursor-pointer h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-9 h-9 cursor-pointer rounded-xl text-sm font-medium transition ${
                      page === num
                        ? "bg-red-500 text-white"
                        : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-9 h-9 cursor-pointer rounded-xl flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
