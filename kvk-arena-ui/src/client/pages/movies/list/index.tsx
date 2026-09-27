import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import thumbnail from "@/assets/spiderman_bg.jpeg";
import MovieLibraryModal from "@/components/movies-list";

export default function MoviesList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  interface Movie {
    id: string;
    title: string;
    image: string;
    platform: string;
    imdb: number;
    rating: number;
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovies, setShowMovies] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -900 : 900,
      behavior: "smooth",
    });
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);

      const [netflixRes, primeRes] = await Promise.all([
        fetch(
          "https://api.themoviedb.org/3/discover/movie?api_key=ea74295f9cddcb6bece48d18bc65ef7d&with_watch_providers=8&watch_region=US&page=1",
        ),
        fetch(
          "https://api.themoviedb.org/3/discover/movie?api_key=ea74295f9cddcb6bece48d18bc65ef7d&with_watch_providers=9&watch_region=US&page=1",
        ),
      ]);

      const netflixData = await netflixRes.json();
      const primeData = await primeRes.json();

      const netflixMovies = netflixData.results.map((movie: any) => ({
        id: `netflix-${movie.id}`,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : thumbnail,
        platform: "Netflix",
        imdb: Number(movie.vote_average.toFixed(1)),
        rating: Number(movie.vote_average.toFixed(1)),
      }));

      const primeMovies = primeData.results.map((movie: any) => ({
        id: `prime-${movie.id}`,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : thumbnail,
        platform: "Prime Video",
        imdb: Number(movie.vote_average.toFixed(1)),
        rating: Number(movie.vote_average.toFixed(1)),
      }));

      const mixedMovies = shuffleArray([
        ...netflixMovies,
        ...primeMovies,
      ]).slice(0, 10);

      setMovies(mixedMovies);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const shuffleArray = <T,>(array: T[]) => {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
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
              Popular Movies
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Discover trending action and adventure films.
            </p>
          </div>

          <MovieLibraryModal
            isOpen={showMovies}
            onClose={() => setShowMovies(false)}
          />

          {/* Right */}
          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-5">
            {/* Align with Explore */}
            <button
              onClick={() => setShowMovies(true)}
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
              View More Movies
            </button>

            {/* Align with Popular Movies */}
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="
            flex gap-3 overflow-x-auto scroll-smooth
            scrollbar-hide
            pb-10
            sm:gap-5
          "
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                data-aos="fade-up"
                className="
                group
                min-w-[140px]
                max-w-[140px]
                overflow-hidden
                rounded-2xl
                bg-white
                border border-slate-200
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)]
                sm:min-w-[230px]
                sm:max-w-[230px]
                sm:rounded-[24px]
            "
              >
                {/* Thumbnail */}
                <div className="relative p-2 pb-0 sm:p-3">
                  <div className="overflow-hidden rounded-xl sm:rounded-[18px]">
                    <img
                      src={movie.image}
                      alt=""
                      className="
                    aspect-[2/3]
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                    "
                    />
                  </div>

                  {/* IMDB Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded bg-[#F5C518] px-1.5 py-0.5 text-[10px] font-bold text-black sm:top-5 sm:left-5 sm:gap-2 sm:px-2 sm:py-1 sm:text-xs">
                    <span>IMDb</span>
                    <span className="text-[10px] font-semibold text-black sm:text-sm">
                      {movie.imdb}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 sm:text-lg">
                    {movie.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">
                    Available for booking
                  </p>

                  {/* Bottom Row */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 sm:text-xs">Platform</p>

                      <p className="text-xs font-semibold text-slate-900 sm:text-base">
                        {movie.platform}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 sm:text-xs">Rating</p>

                      <p className="text-xs font-semibold text-amber-500 sm:text-base">
                        ★ {movie.rating}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
