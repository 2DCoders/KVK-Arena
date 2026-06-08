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

  return (
    <section className="relative overflow-hidden bg-[#0B0B0B] py-24 text-white">
      {/* Glow Effects */}
      <div className="absolute left-0 top-20 h-96 w-96 rounded-full bg-[#A65A2A]/20 blur-[140px]" />
      <div className="absolute bottom-20 right-0 h-96 w-96 rounded-full bg-[#C9773A]/20 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center" data-aos="fade-up">
          <span className="rounded-full border border-[#A65A2A]/30 bg-[#A65A2A]/10 px-4 py-2 text-sm font-semibold text-[#D98B4D]">
            OUR COURTS
          </span>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Premium Courts For
            <span className="block bg-gradient-to-r from-[#D98B4D] to-[#F6C08C] bg-clip-text pb-3 text-transparent">
              Every Match
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Experience world-class badminton courts designed for performance,
            comfort and unforgettable gameplay.
          </p>
        </div>

        {/* Courts */}
        <div className="grid gap-8 lg:grid-cols-2" data-aos="fade-up">
          {courts.map((courtItem) => (
            <div
              key={courtItem.id}
              className="
                group
                overflow-hidden
                rounded-[32px]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#A65A2A]/40
                hover:shadow-[0_30px_80px_rgba(166,90,42,0.25)]
              "
            >
              {/* Slider */}
              <div className="relative h-[380px] overflow-hidden">
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
                        className="h-full w-full cursor-pointer object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                {/* Price */}
                <div className="absolute left-6 top-6 z-10 rounded-2xl bg-white/90 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs text-gray-500">
                    Starting From
                  </p>

                  <p className="font-black text-[#A65A2A]">
                    {courtItem.price}
                  </p>
                </div>

                {/* Title */}
                <div className="absolute bottom-6 left-6 z-10">
                  <h3 className="text-4xl font-black">
                    {courtItem.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-7">
                <p className="leading-relaxed text-zinc-400">
                  {courtItem.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {courtItem.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-[#D98B4D]"
                      />
                      {feature}
                    </div>
                  ))}
                </div>
<a href="#bookings" className="text-white">
                <button
                  className="
                    mt-8
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-[#A65A2A]
                    to-[#C9773A]
                    px-7
                    py-3.5
                    font-semibold
                    transition-all
                    duration-300
                    hover:gap-4
                    hover:shadow-[0_15px_40px_rgba(201,119,58,0.4)]
                  "
                >
                 
                            Book Court
                  <ArrowRight size={18} />
                </button>
                        </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[galleryIndex]}
              alt=""
              className="mx-auto max-h-[80vh] rounded-2xl"
            />

            <button
              onClick={() =>
                setGalleryIndex(
                  (galleryIndex - 1 + galleryImages.length) %
                    galleryImages.length
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white backdrop-blur"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setGalleryIndex(
                  (galleryIndex + 1) % galleryImages.length
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white backdrop-blur"
            >
              <ChevronRight />
            </button>

            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute right-0 top-0 rounded-full cursor-pointer bg-white/20 p-3 text-white backdrop-blur"
            >
              <X />
            </button>

            <div className="mt-5 flex justify-center gap-3 overflow-x-auto">
              {galleryImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt=""
                  onClick={() => setGalleryIndex(index)}
                  className={`h-20 w-28 cursor-pointer rounded-lg object-cover border-2 ${
                    galleryIndex === index
                      ? "border-white"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}