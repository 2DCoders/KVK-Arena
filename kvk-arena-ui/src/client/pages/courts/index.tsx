import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import court1 from "@/assets/court.png";
import court2 from "@/assets/court.png";
import court3 from "@/assets/court.png";
import court4 from "@/assets/court.png";

const courts = [
  {
    id: 1,
    title: "Court 01",
    price: "LKR 2,500/hr",
    images: [court1, court2, court3, court4],
    description:
      "Professional badminton court with premium flooring and tournament-grade lighting.",
    features: ["AC", "LED Lighting", "Premium Flooring"],
  },
  {
    id: 2,
    title: "Court 02",
    price: "LKR 2,500/hr",
    images: [court2, court3, court4, court1],
    description:
      "Tournament-standard court designed for professional training and competitive matches.",
    features: ["Changing Room", "Locker Access", "VIP Area"],
  },
];

export default function Courts() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (images: string[], index: number) => {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  const showPreviousImage = () => {
    setGalleryIndex(
      (galleryIndex - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const showNextImage = () => {
    setGalleryIndex((galleryIndex + 1) % galleryImages.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#0B0B0B] py-14 text-white sm:py-20 lg:py-24">
      {/* Glow Effects */}
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-[#A65A2A]/20 blur-[100px] sm:h-96 sm:w-96 sm:blur-[140px]" />
      <div className="absolute bottom-20 right-0 h-64 w-64 rounded-full bg-[#C9773A]/20 blur-[100px] sm:h-96 sm:w-96 sm:blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div
          className="mb-9 text-center sm:mb-12 lg:mb-16"
          data-aos="fade-up"
        >
          <span className="inline-flex rounded-full border border-[#A65A2A]/30 bg-[#A65A2A]/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#D98B4D] sm:px-4 sm:py-2 sm:text-sm">
            OUR COURTS
          </span>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:mt-5 sm:text-4xl md:text-5xl">
            Premium Courts For
            <span className="block bg-gradient-to-r from-[#D98B4D] to-[#F6C08C] bg-clip-text pb-2 text-transparent sm:pb-3">
              Every Match
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl px-2 text-sm leading-6 text-zinc-400 sm:mt-5 sm:max-w-2xl sm:px-0 sm:text-base sm:leading-normal">
            Experience world-class badminton courts designed for performance,
            comfort and unforgettable gameplay.
          </p>
        </div>

        {/* Courts */}
        <div
          className="grid gap-5 sm:gap-7 lg:grid-cols-2 lg:gap-8"
          data-aos="fade-up"
        >
          {courts.map((courtItem) => (
            <div
              key={courtItem.id}
              className="
                group
                overflow-hidden
                rounded-[24px]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#A65A2A]/40
                hover:shadow-[0_30px_80px_rgba(166,90,42,0.25)]
                sm:rounded-[28px]
                lg:rounded-[32px]
              "
            >
              {/* Slider */}
              <div className="relative h-[230px] overflow-hidden sm:h-[300px] lg:h-[380px]">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  loop
                  className="h-full w-full"
                >
                  {courtItem.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={courtItem.title}
                        onClick={() =>
                          openGallery(courtItem.images, index)
                        }
                        className="h-full w-full cursor-pointer object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Court Badge */}
                <div className="absolute left-4 top-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md sm:px-3.5 sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D98B4D]" />
                    Premium Court
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3 sm:bottom-6 sm:left-6 sm:right-6">
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 sm:text-[10px] sm:tracking-[0.18em]">
                      KVK ARENA
                    </p>

                    <h3 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                      {courtItem.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 lg:p-7">
                <p className="text-sm leading-6 text-zinc-400 sm:text-base sm:leading-relaxed">
                  {courtItem.description}
                </p>

                {/* Features */}
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5 lg:mt-6 lg:gap-3">
                  {courtItem.features.map((feature) => (
                    <div
                      key={feature}
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-medium
                        text-zinc-200
                        sm:gap-2
                        sm:px-3
                        sm:py-2
                        sm:text-xs
                        lg:px-4
                        lg:py-2
                        lg:text-sm
                      "
                    >
                      <CheckCircle2
                        size={13}
                        className="shrink-0 text-[#D98B4D] sm:h-4 sm:w-4"
                      />

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Book Button */}
                <a
                  href="#bookings"
                  className="
                    mt-5
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-[#A65A2A]
                    to-[#C9773A]
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    duration-300
                    hover:gap-4
                    hover:shadow-[0_15px_40px_rgba(201,119,58,0.4)]
                    sm:mt-6
                    sm:w-fit
                    sm:justify-start
                    sm:px-7
                    sm:py-3.5
                    lg:mt-8
                  "
                >
                  <span>Book Court</span>
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/95
            p-3
            sm:p-4
          "
          onClick={closeGallery}
        >
          <div
            className="
              relative
              flex
              w-full
              max-w-6xl
              flex-col
              items-center
              justify-center
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeGallery}
              aria-label="Close gallery"
              className="
                absolute
                right-1
                top-1
                z-20
                flex
                h-9
                w-9
                cursor-pointer
                items-center
                justify-center
                rounded-full
                bg-white/15
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/25
                sm:right-0
                sm:top-0
                sm:h-11
                sm:w-11
              "
            >
              <X size={19} />
            </button>

            {/* Main Image */}
            <div className="relative flex w-full items-center justify-center">
              <img
                src={galleryImages[galleryIndex]}
                alt=""
                className="
                  max-h-[65vh]
                  max-w-full
                  rounded-xl
                  object-contain
                  shadow-2xl
                  sm:max-h-[75vh]
                  sm:rounded-2xl
                "
              />

              {/* Previous */}
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous image"
                className="
                  absolute
                  left-1
                  top-1/2
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-white/25
                  sm:left-4
                  sm:h-11
                  sm:w-11
                "
              >
                <ChevronLeft size={21} />
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="
                  absolute
                  right-1
                  top-1/2
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-white/25
                  sm:right-4
                  sm:h-11
                  sm:w-11
                "
              >
                <ChevronRight size={21} />
              </button>
            </div>

            {/* Gallery Counter */}
            <div className="mt-3 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-md sm:mt-4 sm:text-xs">
              {galleryIndex + 1} / {galleryImages.length}
            </div>

            {/* Thumbnails */}
            <div
              className="
                mt-3
                flex
                max-w-full
                gap-2
                overflow-x-auto
                px-1
                pb-1
                sm:mt-5
                sm:gap-3
              "
            >
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setGalleryIndex(index)}
                  className={`
                    relative
                    h-14
                    w-20
                    shrink-0
                    cursor-pointer
                    overflow-hidden
                    rounded-lg
                    border-2
                    transition-all
                    sm:h-20
                    sm:w-28
                    sm:rounded-xl
                    ${
                      galleryIndex === index
                        ? "border-white opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }
                  `}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

