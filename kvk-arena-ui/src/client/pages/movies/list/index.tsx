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
              Popular Movies
            </h2>

            <p className="mt-2 text-slate-500">
              Discover trending action and adventure films.
            </p>
          </div>

          <MovieLibraryModal
            isOpen={showMovies}
            onClose={() => setShowMovies(false)}
          />

          {/* Right */}
          <div className="flex flex-col items-end gap-5">
            {/* Align with Explore */}
            <button
              onClick={() => setShowMovies(true)}
              className="
        text-red-500
        font-semibold
        hover:text-red-600
        hover:underline
        transition
        cursor-pointer
      "
            >
              View More Movies
            </button>

            {/* Align with Popular Movies */}
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="
            flex gap-5 overflow-x-auto scroll-smooth
            scrollbar-hide
            pb-10
          "
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                data-aos="fade-up"
                className="
                group
                min-w-[230px]
                max-w-[230px]
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
                  <div className="absolute top-5 left-5 flex items-center gap-2 rounded bg-[#F5C518] px-2 py-1 text-xs font-bold text-black">
                    <span>IMDb</span>
                    <span className="text-sm font-semibold text-black">
                      {movie.imdb}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {movie.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Available for booking
                  </p>

                  {/* Bottom Row */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Platform</p>

                      <p className="font-semibold text-slate-900">
                        {movie.platform}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Rating</p>

                      <p className="font-semibold text-amber-500">
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
