import court from "@/assets/court.png";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const courts = [
  {
    id: 1,
    title: "Court 01",
    price: "LKR 2,500/hr",
    description:
      "Professional badminton court with premium flooring and tournament-grade lighting for an unmatched playing experience.",
    features: ["AC", "LED Lighting", "Premium Flooring"],
  },
  {
    id: 2,
    title: "Court 02",
    price: "LKR 2,500/hr",
    description:
      "Tournament-standard court designed for professional training sessions and competitive matches.",
    features: ["AC", "Changing Room", "Locker Access"],
  },
  {
    id: 3,
    title: "Court 03",
    price: "LKR 3,000/hr",
    description:
      "VIP court featuring exclusive seating, enhanced amenities, and a premium environment.",
    features: ["VIP Seating", "Premium Lighting", "Shower Room"],
  },
  {
    id: 4,
    title: "Court 04",
    price: "LKR 2,000/hr",
    description:
      "Perfect for casual games and practice sessions with all essential facilities included.",
    features: ["Indoor", "Scoreboard", "Parking"],
  },
  {
    id: 5,
    title: "Court 05",
    price: "LKR 2,000/hr",
    description:
      "Modern court with excellent visibility and a comfortable playing atmosphere.",
    features: ["Indoor", "Scoreboard", "Parking"],
  },
];

export default function Courts() {
  const [activeCourt, setActiveCourt] = useState(0);

  return (
    <section className="overflow-hidden bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-4 inline-block rounded-full border border-[#D98B4D]/30 bg-[#296BE1]/10 px-4 py-2 text-sm font-semibold text-[#D98B4D]">
              OUR COURTS
            </span>

            <h2 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              World-Class Courts Built For Champions
            </h2>
          </div>

          <p className="max-w-md text-lg leading-relaxed text-zinc-400">
            Experience premium badminton courts engineered for comfort,
            performance, and unforgettable matches.
          </p>
        </div>

        {/* Courts */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {courts.map((courtItem, index) => {
            const isActive = activeCourt === index;

            return (
              <div
                key={courtItem.id}
                onMouseEnter={() => setActiveCourt(index)}
                className={`
                  relative
                  h-[580px]
                  flex-shrink-0
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-white/10
                  cursor-pointer
                  transition-all
                  duration-700
                  ease-out
                  group
                  ${
                    isActive
                      ? "w-[700px]"
                      : "w-[120px] hover:w-[140px]"
                  }
                `}
              >
                {/* Background */}
                <img
                  src={court}
                  alt={courtItem.title}
                  className="
                    absolute inset-0
                    h-full w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

                {/* Active Card */}
                {isActive ? (
                  <>
                    {/* Price Badge */}
                    <div className="absolute right-6 top-6 z-20">
                      <div
                        className="
                          rounded-full
                          border border-white/10
                          bg-white/10
                          px-5 py-2
                          backdrop-blur-xl
                        "
                      >
                        <span className="font-semibold text-white">
                          {courtItem.price}
                        </span>
                      </div>
                    </div>

                    {/* Court Number */}
                    <div
                      className="
                        absolute
                        bottom-0
                        right-4
                        text-[220px]
                        font-black
                        leading-none
                        text-white/[0.05]
                        pointer-events-none
                      "
                    >
                      {String(courtItem.id).padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-8 left-8 z-20 max-w-md">
                      <span className="font-medium text-[#D98B4D]">
                        Premium Court
                      </span>

                      <h3 className="mt-3 text-5xl font-bold">
                        {courtItem.title}
                      </h3>

                      <p className="mt-4 leading-relaxed text-zinc-300">
                        {courtItem.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {courtItem.features.map((feature) => (
                          <span
                            key={feature}
                            className="
                              rounded-full
                              border border-white/10
                              bg-white/5
                              px-4 py-2
                              text-sm
                              backdrop-blur-md
                            "
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <button
                        className="
                          mt-8
                          flex
                          items-center
                          gap-2
                          rounded-full
                          bg-[#A65A2A]
                          cursor-pointer
                          px-7
                          py-3.5
                          font-semibold
                          transition-all
                          hover:gap-4
                          hover:bg-[#C9773A]
                        "
                      >
                        Book Court
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Small Number Badge */}
                    <div className="absolute left-4 top-4 z-10">
                      <div
                        className="
                          rounded-full
                          border border-white/10
                          bg-white/10
                          px-3 py-1
                          text-xs
                          backdrop-blur-lg
                        "
                      >
                        {String(courtItem.id).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Vertical Text */}
                    <div
                      className="
                        absolute
                        left-1/2
                        bottom-26
                        -translate-x-1/2
                        rotate-[-90deg]
                        whitespace-nowrap
                        text-2xl
                        font-semibold
                        tracking-[0.25em]
                      "
                    >
                      {courtItem.title}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}