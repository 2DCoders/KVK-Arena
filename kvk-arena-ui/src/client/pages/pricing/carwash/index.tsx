import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import { getCarServices } from "@/services/car-service-api";

interface PricingItem {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function CarwashPricing() {
  const [selectedItem, setSelectedItem] = useState<PricingItem | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [services, setServices] = useState<PricingItem[]>([])

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = showAll ? services : services.slice(0, 10);
  const hasMoreItems = services.length > 10;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK").format(price);

  const scrollCards = (direction: "left" | "right") => {
    scrollContainerRef.current?.scrollBy({
      left: direction === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  const fetchServices = async () => {
  try {
    const response = await getCarServices();

    const data = response.data.map((item: any) => ({
      ...item,
      image: item.image
        ? `data:image/jpeg;base64,${item.image}`
        : "",
    }));

    setServices(data);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchServices()
  },[])

  useEffect(() => {
    document.body.style.overflow = selectedItem ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <section
        id="pricing"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f1f5f9_100%)] py-20 sm:py-24 lg:py-28"
      >
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-blue-100/80 blur-[110px]" />

          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-100/70 blur-[110px]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-9 bg-gradient-to-r from-[#1473ff] to-transparent" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1473ff]">
                  Car Care Pricing
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                Premium care.
                <span className="ml-2 bg-gradient-to-r from-[#1473ff] via-[#3487ff] to-[#56a5ff] bg-clip-text text-transparent">
                  Clear pricing.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Choose the right level of care for your vehicle. Every service
                is completed using quality products and professional attention
                to detail.
              </p>
            </div>

            {/* Desktop controls */}
            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollCards("left")}
                aria-label="Scroll pricing cards left"
                className="flex h-11 cursor-pointer w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => scrollCards("right")}
                aria-label="Scroll pricing cards right"
                className="flex h-11 cursor-pointer w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* Pricing carousel */}
          <div
            ref={scrollContainerRef}
            className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12"
          >
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="group relative min-w-[85vw] snap-start overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_25px_65px_rgba(20,115,255,0.14)] sm:min-w-[320px] lg:min-w-[375px]"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-slate-50 sm:h-60">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" /> */}

                  {/* Badge */}
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-md">
                    <Sparkles size={13} className="text-[#1473ff]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-700">
                      Premium Care
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      aria-label={`View ${item.title}`}
                      className="flex cursor-pointer h-14 w-14 scale-75 items-center justify-center rounded-full bg-[#1473ff] text-white opacity-0 shadow-[0_14px_35px_rgba(20,115,255,0.35)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 hover:bg-[#0f66e8]"
                    >
                      <Eye size={21} />
                    </button>
                  </div>
                </div>

                {/* Card content */}
                <div className="relative p-5 sm:p-6">
                  {/* <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" /> */}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                        Starting from
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      aria-label={`Open ${item.title} details`}
                      className="flex h-10 cursor-pointer w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff]"
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1473ff]">
                      LKR
                    </span>

                    <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                      {formatPrice(item.price)} /=
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1473ff] transition-all duration-300 hover:gap-3 hover:text-[#0f66e8]"
                  >
                    View details
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile hint */}
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400 sm:hidden">
            <ChevronLeft size={14} />
            <span>Swipe to explore services</span>
            <ChevronRight size={14} />
          </div>

          {/* View more */}
          {hasMoreItems && (
            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="inline-flex cursor-pointer h-12 items-center justify-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-7 text-sm font-semibold text-[#1473ff] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
              >
                {showAll ? "Show Less" : "View More"}

                <ArrowRight
                  size={17}
                  className={`transition-transform duration-300 ${
                    showAll ? "-rotate-90" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Details modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-modal-title"
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
          >
            {/* Modal background effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
              <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-100/70 blur-[100px]" />
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close pricing details"
              className="absolute cursor-pointer right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] sm:right-5 sm:top-5"
            >
              <X size={20} />
            </button>

            <div className="relative grid lg:grid-cols-[0.95fr_1.05fr]">
              {/* Modal image */}
              <div className="relative min-h-[260px] overflow-hidden rounded-t-[30px] bg-slate-100 lg:min-h-[500px] lg:rounded-l-[30px] lg:rounded-tr-none">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white" />

                <div className="absolute bottom-5 left-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-md">
                  Professional Auto Care
                </div>
              </div>

              {/* Modal content */}
              <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-9 bg-gradient-to-r from-[#1473ff] to-transparent" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#1473ff]">
                    Service Details
                  </span>
                </div>

                <h3
                  id="pricing-modal-title"
                  className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
                >
                  {selectedItem.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                  {selectedItem.description}
                </p>

                <div className="my-7 h-px bg-gradient-to-r from-slate-200 via-blue-200 to-transparent" />

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Starting price
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="pb-1.5 text-sm font-semibold text-[#1473ff]">
                      LKR
                    </span>

                    <span className="text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                      {formatPrice(selectedItem.price)} /=
                    </span>
                  </div>
                </div>

                {/* <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);

                    setTimeout(() => {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1473ff] px-6 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(20,115,255,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f66e8] hover:shadow-[0_18px_42px_rgba(20,115,255,0.36)] sm:w-fit"
                >
                  Contact Us
                  <ArrowRight size={17} />
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}