import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
} from "lucide-react";

import cutImg from "@/assets/cut.png";
import detailing from "@/assets/detailing.png";
import vaccum from "@/assets/vaccum.png";
import wash from "@/assets/wash.png";

const services = [
  {
    id: "01",
    shortId: "01",
    title: "Car Wash",
    label: "Exterior Care",
    description:
      "A complete exterior wash that removes dirt, dust and road grime while restoring a clean and refreshed finish.",
    image: wash,
  },
  {
    id: "02",
    shortId: "02",
    title: "Car Vacuum",
    label: "Interior Care",
    description:
      "Thorough interior vacuuming for seats, carpets and hard-to-reach areas to keep your cabin clean and comfortable.",
    image: vaccum,
  },
  {
    id: "03",
    shortId: "03",
    title: "Car Detailing",
    label: "Complete Care",
    description:
      "Professional interior and exterior detailing designed to improve your vehicle’s appearance and preserve its condition.",
    image: detailing,
  },
  {
    id: "04",
    shortId: "04",
    title: "Cut & Polish",
    label: "Paint Correction",
    description:
      "Advanced paint correction and polishing that reduces minor scratches, swirl marks and restores a glossy finish.",
    image: cutImg,
  },
];

export default function CarwashServices() {
  const [activeService, setActiveService] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#f7f7f5]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-32 h-[340px] w-[340px] rounded-full bg-blue-500/[0.06] blur-[110px]" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-[380px] w-[380px] rounded-full bg-[#1473ff]/[0.05] blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-24">
        {/* =====================================================
            HEADING
        ====================================================== */}
        <div className="mb-10 text-center sm:mb-14 lg:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1473ff] shadow-[0_0_8px_rgba(20,115,255,0.75)]" />

            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1473ff] sm:text-xs">
              Premium Car Care
            </p>
          </div>

          <h2 className="mx-auto max-w-3xl font-serif text-[2.6rem] font-semibold uppercase leading-[0.96] tracking-[-0.035em] text-zinc-950 sm:text-5xl lg:text-6xl">
            Our Car Wash

            <span className="mt-1 block font-normal italic text-zinc-500">
              Services
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base sm:leading-7">
            Professional cleaning, detailing and
            paint-care solutions designed to keep
            your vehicle looking its absolute best.
          </p>
        </div>

        {/* =====================================================
            MOBILE SERVICES
        ====================================================== */}
        <div className="md:hidden">
          {/* Mobile service navigation */}
          <div className="mb-5 flex items-center justify-between overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            {services.map((service, index) => {
              const isActive =
                activeService === index;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    setActiveService(index)
                  }
                  aria-label={`Select ${service.title}`}
                  className={`relative flex h-11 min-w-11 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  {service.shortId}

                  {isActive && (
                    <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#1473ff]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile active card */}
          <div
            key={services[activeService].id}
            className="animate-[serviceReveal_500ms_ease-out] overflow-hidden rounded-[30px] bg-zinc-950 shadow-[0_28px_70px_rgba(0,0,0,0.22)]"
          >
            {/* Image */}
            <div className="relative h-[300px] overflow-hidden min-[390px]:h-[340px]">
              <img
                src={
                  services[activeService].image
                }
                alt={
                  services[activeService].title
                }
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Image overlays */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-zinc-950" />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

              {/* Number */}
              <div className="absolute left-5 top-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/25 text-sm font-bold text-white shadow-lg backdrop-blur-xl">
                  {
                    services[activeService]
                      .shortId
                  }
                </span>
              </div>

              {/* Label */}
              <div className="absolute right-5 top-5">
                <span className="rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
                  {
                    services[activeService]
                      .label
                  }
                </span>
              </div>

              {/* Image bottom title */}
              <div className="absolute bottom-5 left-5 right-5">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-[#70b7ff]">
                  KVK Arena
                </p>

                <h3 className="max-w-[280px] text-[2.25rem] font-black uppercase leading-[0.92] tracking-[-0.045em] text-white">
                  {
                    services[activeService]
                      .title
                  }
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-6 pt-2">
              <p className="text-sm leading-6 text-zinc-400">
                {
                  services[activeService]
                    .description
                }
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  "Professional care",
                  "Premium products",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-300">
                      <Check
                        size={11}
                        strokeWidth={3}
                      />
                    </span>

                    <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/60">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="group mt-5 flex h-13 w-full cursor-pointer items-center justify-between rounded-full bg-white px-5 text-left text-xs font-bold uppercase tracking-[0.1em] text-zinc-950 transition active:scale-[0.98]"
              >
                <span>Explore Service</span>

                <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-white">
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Mobile service list */}
          {/* <div className="mt-4 space-y-2">
            {services.map((service, index) => {
              const isActive =
                activeService === index;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    setActiveService(index)
                  }
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-300 ${
                    isActive
                      ? "border-blue-200 bg-blue-50/80"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
                        isActive
                          ? "text-[#1473ff]"
                          : "text-zinc-400"
                      }`}
                    >
                      {service.label}
                    </p>

                    <h4 className="mt-1 truncate text-sm font-bold uppercase text-zinc-950">
                      {service.title}
                    </h4>
                  </div>

                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                      isActive
                        ? "bg-[#1473ff] text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <ChevronRight size={17} />
                  </span>
                </button>
              );
            })}
          </div> */}
        </div>

        {/* =====================================================
            TABLET / DESKTOP SERVICES
        ====================================================== */}
        <div className="relative hidden md:block">
          {services.map((service, index) => {
            const isActive =
              activeService === index;

            return (
              <button
                key={service.id}
                type="button"
                onMouseEnter={() =>
                  setActiveService(index)
                }
                onFocus={() =>
                  setActiveService(index)
                }
                onClick={() =>
                  setActiveService(index)
                }
                className={`group relative grid w-full cursor-pointer items-center gap-5 border-b text-left transition-all duration-500 first:border-t ${
                  isActive
                    ? "z-20 min-h-[190px] rounded-[24px] border-transparent bg-black px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8 lg:min-h-[160px] lg:px-10"
                    : "min-h-[150px] border-zinc-300 px-2 py-7 hover:bg-black/[0.025] sm:px-5 lg:min-h-[118px]"
                } grid-cols-[70px_220px_1fr_64px] lg:grid-cols-[70px_240px_1fr_72px]`}
              >
                {/* Number */}
                <span
                  className={`self-center text-lg font-medium transition-colors duration-300 sm:text-xl ${
                    isActive
                      ? "text-white"
                      : "text-zinc-950"
                  }`}
                >
                  {service.id}
                </span>

                {/* Title */}
                <h3
                  className={`self-center text-xl font-semibold uppercase tracking-tight transition-colors duration-300 sm:text-2xl lg:text-[27px] ${
                    isActive
                      ? "text-white"
                      : "text-zinc-950"
                  }`}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className={`max-w-xl pr-24 text-sm leading-6 transition-colors duration-300 lg:text-[15px] lg:leading-7 ${
                    isActive
                      ? "text-zinc-300"
                      : "text-zinc-600"
                  }`}
                >
                  {service.description}
                </p>

                {/* Arrow */}
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 lg:h-14 lg:w-14 ${
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

      <style>{`
        @keyframes serviceReveal {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}