import { useRef, useState } from "react";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import gym from "@/assets/gym.png";
import carwash from "@/assets/carwash.jpg";
import badminton from "@/assets/badminton.jpg";
import gaming from "@/assets/billiard.jpg";
import cafe from "@/assets/coffee.jpg";
import AOS from "aos";
// import { useNavigate } from "react-router-dom";
import ConstructionModal from "@/components/404";

const services = [
  {
    id: 1,
    title: "Gym",
    tag: "Fitness",
    category: "gym",
    desc: "Modern training space for strength, cardio, and active recovery.",
    img: gym,
    navigateTo: "/gym",
  },
  {
    id: 2,
    title: "Car Wash",
    tag: "Cleaning",
    category: "carwash",
    desc: "Professional wash and shine services to keep vehicles spotless.",
    img: carwash,
    navigateTo: "/carwash",
  },
  {
    id: 3,
    title: "Badminton Court",
    tag: "Sport",
    category: "badminton",
    desc: "Fast-paced indoor court booking for training and friendly matches.",
    img: badminton,
    navigateTo: "/badminton",
  },
  {
    id: 4,
    title: "Gaming Centre",
    tag: "Entertainment",
    category: "gaming",
    desc: "Relax and play in a dedicated gaming zone with a premium setup.",
    img: gaming,
    navigateTo: "/gaming",
  },
  {
    id: 5,
    title: "Cafe",
    tag: "Food & Beverage",
    category: "cafe",
    desc: "Relax and enjoy delicious coffee and snacks in a cozy environment.",
    img: cafe,
    navigateTo: "/cafe",
  },
];

const tabs = [
  { key: "all", label: "All Services" },
  { key: "gym", label: "Gym" },
  { key: "carwash", label: "Car Wash" },
  { key: "badminton", label: "Badminton" },
  { key: "gaming", label: "Gaming" },
  { key: "cafe", label: "Cafe" },
];

export default function Services() {
  const [activeTab, setActiveTab] = useState("all");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [open404, setOpen404] = useState(false);
  const [pageName, setPageName] = useState("Services Section");

  // const navigate = useNavigate();

  const scrollServices = (direction: "left" | "right") => {
    const container = scrollerRef.current;

    if (!container) return;

    const distance = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const visibleServices =
    activeTab === "all"
      ? services
      : services.filter((service) => service.category === activeTab);

  useEffect(() => {
    // Refresh AOS animations when visible services change (filtering)
    AOS.refresh();
  }, [visibleServices]);

  const handleOpen404 = (serviceName: string) => {
    setPageName(serviceName);
    setOpen404(true);
  };

  return (
    <section className="relative overflow-hidden bg-white/5 py-10 lg:py-16">
      <ConstructionModal
        open={open404}
        onClose={() => setOpen404(false)}
        pageName={pageName}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            data-aos="fade-up"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent"
          >
            Our Core Services
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-4 text-base text-slate-500"
          >
            From AI solutions to custom development, we provide the tools and
            expertise to help your business grow smarter, faster, and more
            efficiently.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 lg:flex-row">
          <button
            data-aos="fade-right"
            type="button"
            onClick={() => setActiveTab("all")}
            className="hidden rounded-full cursor-pointer border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
          >
            View All
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  data-aos="fade-left"
                  data-aos-delay={`${tabs.findIndex((t) => t.key === tab.key) * 100}`}
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full cursor-pointer px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#296BE1] text-white shadow-[0_10px_30px_rgba(41,107,225,0.28)]"
                      : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Scroll services left"
            onClick={() => scrollServices("left")}
            className="absolute left-0 top-1/2 z-20 cursor-pointer hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/90 p-3 text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1/2 hover:border-sky-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950 hover:shadow-[0_18px_45px_rgba(37,99,235,0.18)] md:inline-flex"
          >
            <ArrowLeft size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="overflow-x-auto pb-4 scrollbar-none scroll-smooth"
          >
            <div className="flex w-max gap-6 snap-x snap-mandatory pr-14 md:pr-16">
              {visibleServices.map((service, idx) => (
                <article
                  key={service.id}
                  data-aos="fade-up"
                  data-aos-delay={`${idx * 400}`}
                  className="group relative min-w-70 snap-start overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.15)] transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:min-w-80 lg:min-w-75"
                >
                  <div className="relative aspect-2/3 w-full">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/35 to-slate-950/90" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                      <div>
                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                          {service.tag}
                        </span>
                        <h3 className="mt-4 text-2xl font-bold leading-tight text-white">
                          {service.title}
                        </h3>
                        <p className="mt-3 max-w-[18ch] text-sm leading-6 text-slate-200/90">
                          {service.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6">
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#CFEFFF]">
                          {service.category}
                        </span>
                        <button
                          onClick={() => {
                            // navigate(service.navigateTo)
                            handleOpen404(service.title);
                          }}
                          type="button"
                          className="inline-flex cursor-pointer h-11 w-11 items-center justify-center rounded-full bg-white text-[#296BE1] shadow-[0_10px_25px_rgba(255,255,255,0.18)] transition hover:scale-105"
                        >
                          <ArrowRight size={18} className="text-[#296BE1]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {visibleServices.length === 0 && (
                <div className="min-w-70 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300 sm:min-w-80 lg:min-w-90">
                  No services found for this tab.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Scroll services right"
            onClick={() => scrollServices("right")}
            className="absolute right-0 top-1/2 z-20 cursor-pointer hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/90 p-3 text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1/2 hover:border-sky-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-slate-950 hover:shadow-[0_18px_45px_rgba(37,99,235,0.18)] md:inline-flex"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
