import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import cutImg from "@/assets/cut.png";
import detailing from "@/assets/detailing.png";
import vaccum from "@/assets/vaccum.png";
import wash from "@/assets/wash.png";

const services = [
  {
    id: "01",
    title: "Car Wash",
    description:
      "A complete exterior wash that removes dirt, dust and road grime while restoring a clean and refreshed finish.",
    image: wash,
  },
  {
    id: "02",
    title: "Car Vacuum",
    description:
      "Thorough interior vacuuming for seats, carpets and hard-to-reach areas to keep your cabin clean and comfortable.",
    image: vaccum,
  },
  {
    id: "03",
    title: "Car Detailing",
    description:
      "Professional interior and exterior detailing designed to improve your vehicle’s appearance and preserve its condition.",
    image: detailing,
  },
  {
    id: "04",
    title: "Cut & Polish",
    description:
      "Advanced paint correction and polishing that reduces minor scratches, swirl marks and restores a glossy finish.",
    image: cutImg,
  },
];

export default function CarwashServices() {
  const [activeService, setActiveService] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#f7f7f5]">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24 lg:pt-22">
        {/* Heading */}
        <div className="mb-14 text-center sm:mb-16 lg:mb-20" data-aos="fade-up">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#1473ff] sm:text-sm">
            Premium Car Care
          </p>

          <h2 className="mx-auto max-w-3xl font-serif text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Our Car Wash
            <span className="block font-normal italic text-zinc-600">
              Services
            </span>
          </h2>
        </div>

        {/* Services */}
        <div className="relative">
          {services.map((service, index) => {
            const isActive = activeService === index;

            return (
              <button
                key={service.id}
                type="button"
                onMouseEnter={() => setActiveService(index)}
                onFocus={() => setActiveService(index)}
                onClick={() => setActiveService(index)}
                className={`group relative grid w-full cursor-pointer items-center gap-5 border-b text-left transition-all duration-500 first:border-t
                  ${
                    isActive
                      ? "z-20 min-h-[190px] rounded-[24px] border-transparent bg-black px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8 lg:min-h-[160px] lg:px-10"
                      : "min-h-[150px] border-zinc-300 px-2 py-7 hover:bg-black/[0.025] sm:px-5 lg:min-h-[118px]"
                  }
                  grid-cols-[44px_1fr_54px]
                  md:grid-cols-[70px_220px_1fr_64px]
                  lg:grid-cols-[70px_240px_1fr_72px]`}
              >
                {/* Number */}
                <span
                  className={`self-center text-lg font-medium transition-colors duration-300 sm:text-xl ${
                    isActive ? "text-white" : "text-zinc-950"
                  }`}
                >
                  {service.id}
                </span>

                {/* Title */}
                <h3
                  className={`self-center text-xl font-semibold uppercase tracking-tight transition-colors duration-300 sm:text-2xl lg:text-[27px] ${
                    isActive ? "text-white" : "text-zinc-950"
                  }`}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className={`col-span-3 max-w-xl text-sm leading-6 transition-colors duration-300 md:col-span-1 md:pr-24 lg:text-[15px] lg:leading-7 ${
                    isActive ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {service.description}
                </p>

                {/* Arrow */}
                <span
                  className={`absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 sm:right-7 md:static md:right-auto md:top-auto md:translate-y-0 lg:h-14 lg:w-14 ${
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-zinc-400 bg-transparent text-zinc-950 group-hover:border-black group-hover:bg-black group-hover:text-white"
                  }`}
                >
                  <ArrowUpRight
                    size={22}
                    strokeWidth={1.8}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />
                </span>

                {/* Active floating image */}
                {isActive && (
                  <div className="pointer-events-none absolute right-[82px] top-1/2 hidden h-[148px] w-[140px] -translate-y-1/2 rotate-[-7deg] overflow-hidden rounded-[20px] border-[5px] border-white bg-white shadow-[0_25px_60px_rgba(0,0,0,0.4)] md:block lg:right-[94px] lg:h-[175px] lg:w-[165px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}