import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Star } from "lucide-react";

interface GameLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleImage =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200";

const ITEMS_PER_PAGE = 20;

export default function MovieLibraryModal({
  isOpen,
  onClose,
}: GameLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiPage, setApiPage] = useState(1);
  interface Movie {
    id: number;
    title: string;
    image: string;
    platform: string;
    imdb: number;
    rating: number;
  }
  const fetchMovies = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const [netflixRes, primeRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=ea74295f9cddcb6bece48d18bc65ef7d&with_watch_providers=8&watch_region=US&page=${pageNumber}`,
        ),
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=ea74295f9cddcb6bece48d18bc65ef7d&with_watch_providers=9&watch_region=US&page=${pageNumber}`,
        ),
      ]);

      const netflixData = await netflixRes.json();
      const primeData = await primeRes.json();

      const netflixMovies = netflixData.results.map((movie: any) => ({
        id: `netflix-${movie.id}`,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : sampleImage,
        platform: "Netflix",
        imdb: Number(movie.vote_average.toFixed(1)),
        rating: Number(movie.vote_average.toFixed(1)),
      }));

      const primeMovies = primeData.results.map((movie: any) => ({
        id: `prime-${movie.id}`,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : sampleImage,
        platform: "Prime Video",
        imdb: Number(movie.vote_average.toFixed(1)),
        rating: Number(movie.vote_average.toFixed(1)),
      }));

      // Merge and shuffle
      const combined = [...netflixMovies, ...primeMovies].sort(
        () => Math.random() - 0.5,
      );

      setMovies(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchMovies(apiPage);

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, apiPage]);

  useEffect(() => {
    if (isOpen) {
      setApiPage(1);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [movies, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovies.length / ITEMS_PER_PAGE),
  );

  const paginatedMovies = filteredMovies.slice(
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
            <h2 className="text-xl font-bold text-gray-900">Movie Library</h2>

            <p className="text-sm text-gray-500 mt-1">
              Browse available movies
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
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {filteredMovies.length} Movies Found
            </p>

            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {paginatedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="p-3 pb-0">
                    <div className="aspect-[2/3] overflow-hidden rounded-2xl">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      {movie.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Available for streaming
                    </p>

                    <p className="text-[11px] text-gray-400 mt-2">
                      IMDB: {movie.imdb}
                    </p>

                    <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between">
                      <div>
                        <p className="text-[11px] text-gray-400">Platform</p>

                        <p className="font-semibold text-sm">
                          {movie.platform}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-gray-400">Rating</p>

                        <div className="flex items-center gap-1 text-amber-500 justify-end">
                          <Star size={14} fill="currentColor" />
                          <span className="font-semibold text-sm">
                            {movie.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              disabled={apiPage === 1}
              onClick={() => {
                setApiPage((prev) => prev - 1)
                // scroll to top of content
                const content = document.querySelector(".flex-1")
                if (content) {
                  content.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className="px-5 py-2 cursor-pointer rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
            >
              Prev
            </button>

            <button
              onClick={() => {
                setApiPage((prev) => prev + 1)
                // scroll to top of content
                const content = document.querySelector(".flex-1")
                if (content) {
                  content.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className="px-5 py-2 cursor-pointer rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
