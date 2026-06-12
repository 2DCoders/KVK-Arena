import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import movie1 from "@/assets/movies/movie1.jpg";
import movie2 from "@/assets/movies/movie2.webp";
import movie3 from "@/assets/movies/movie3.png";
import movie4 from "@/assets/movies/movie4.jpg";
import movie5 from "@/assets/movies/movie5.jpg";

const movies = [      
  {
    id: 1,
    title: "The RIP",
    subtitle: "Series",
    description:
      "The RIP follows the story of a group of friends who become entangled in a web of mystery and danger.",
    background: movie5,
    rating: 4.3,
    imdb: 6.8,
  },
  {
    id: 2,
    title: "SPIDER MAN BRAND NEW DAY",
    subtitle: "Movie",
    description:
      "Peter Parker's life is turned upside down when a new villain emerges, threatening New York City and his loved ones.",
    background: movie1,
    rating: 4,
    imdb: 0.0,
  },
  {
    id: 3,
    title: "Mickey 17",
    subtitle: "Movie",
    description:
      "Mickey 17 is a heartwarming tale of friendship and adventure.",
    background: movie2,
    rating: 4,
    imdb: 6.7,
  },  
  {
    id: 4,
    title: "Dhurandhar The Revenge",
    subtitle: "Movie",
    description:
      "Dhurandhar The Revenge is a thrilling action film that follows the story of a man seeking justice and revenge.",
    background: movie3,
    rating: 4.5,
    imdb: 8.3,
  },  
  {
    id: 5,
    title: "Back in Action",
    subtitle: "Movie",
    description:
      "Back in Action is a high-octane thriller that follows the story of a former special forces operative who must go on the run to clear his name.",
    background: movie4,
    rating: 4.2,
    imdb: 5.9,
  },
];

export default function Movies() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="bg-black py-8">
      <div className="container mx-auto px-4">
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
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <div className="relative h-[700px] overflow-hidden rounded-3xl py-10">
                {/* Background */}
                <img
                  src={movie.background}
                  alt={movie.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Left Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

                {/* Blue/Red Cinematic Glow */}
                {/* <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_25%_50%,rgba(59,130,246,0),transparent_10%),radial-gradient(circle_at_80%_30%,rgba(239,68,68,0.3),transparent_40%)]" /> */}

                {/* Content */}
                <div className="relative z-10 flex h-full items-center px-8 lg:px-16 py-10">
                  <div className="max-w-2xl">
                    <h2 className="text-5xl font-black uppercase text-white lg:text-7xl">
                      {movie.title}
                    </h2>

                    <h3 className="mt-3 text-2xl font-bold uppercase tracking-wide text-white lg:text-4xl">
                      {movie.subtitle}
                    </h3>

                    <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-300 lg:text-lg">
                      {movie.description}
                    </p>

                    {/* Rating & IMDB */}
                    <div className="mt-8 flex items-center gap-6">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= movie.rating
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="h-6 w-px bg-white/20" />

                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#F5C518] px-2 py-1 text-xs font-bold text-black">
                          IMDb
                        </span>

                        <span className="text-lg font-semibold text-white">
                          {movie.imdb}/10
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-10 flex flex-wrap gap-4">

                      <a href="#bookings">
                        <button className="rounded-xl cursor-pointer bg-red-600 px-8 py-4 font-semibold text-white transition hover:bg-red-500">
                          Book Now
                        </button>
                      </a>
                      <button className="rounded-xl cursor-pointer border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition hover:border-white/30">
                        View More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-end gap-3">
            <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-red-500" />
          </div>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-12 w-12 items-center justify-center cursor-pointer rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-12 w-12 items-center justify-center cursor-pointer rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
