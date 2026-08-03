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

interface CarServiceApiResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string | null;
  durationInMinutes?: number;
  serviceCategory?: number;
  features?: string | null;
  isActive?: boolean;
}

interface PricingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80";

const getImageSource = (
  image: string | null | undefined,
): string => {
  if (!image?.trim()) {
    return FALLBACK_IMAGE;
  }

  const value = image.trim();

  if (value.startsWith("data:image/")) {
    return value;
  }

  if (value.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${value}`;
  }

  if (value.startsWith("iVBOR")) {
    return `data:image/png;base64,${value}`;
  }

  if (value.startsWith("R0lGOD")) {
    return `data:image/gif;base64,${value}`;
  }

  if (value.startsWith("UklGR")) {
    return `data:image/webp;base64,${value}`;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `data:image/jpeg;base64,${value}`;
};

const extractServices = (
  response: unknown,
): CarServiceApiResponse[] => {
  if (Array.isArray(response)) {
    return response as CarServiceApiResponse[];
  }

  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    const data = (response as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return data as CarServiceApiResponse[];
    }
  }

  return [];
};

export default function CarwashPricing() {
  const [selectedItem, setSelectedItem] =
    useState<PricingItem | null>(null);

  const [showAll, setShowAll] = useState(false);
  const [services, setServices] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = showAll
    ? services
    : services.slice(0, 10);

  const hasMoreItems = services.length > 10;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK").format(
      Number.isFinite(price) ? price : 0,
    );

  const scrollCards = (
    direction: "left" | "right",
  ) => {
    scrollContainerRef.current?.scrollBy({
      left: direction === "left" ? -370 : 370,
      behavior: "smooth",
    });
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getCarServices();
      const responseData = extractServices(response);

      const mappedServices: PricingItem[] = responseData
        .filter((item) => item.isActive !== false)
        .map((item) => ({
          id: item.id,
          title: item.title?.trim() || "Unnamed Service",
          description:
            item.description?.trim() ||
            "Professional vehicle care service.",
          price: Number(item.price) || 0,
          image: getImageSource(item.image),
        }));

      setServices(mappedServices);
    } catch (error) {
      console.error(
        "Failed to load car wash services:",
        error,
      );

      setServices([]);

      setErrorMessage(
        "Unable to load car care services. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedItem
      ? "hidden"
      : "";

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
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <>
      <section
        id="pricing"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f1f5f9_100%)] py-16 sm:py-20 lg:py-28"
      >
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-blue-100/80 blur-[100px] sm:h-96 sm:w-96 sm:blur-[110px]" />

          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-100/70 blur-[100px] sm:h-96 sm:w-96 sm:blur-[110px]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-[#1473ff] to-transparent sm:w-9" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1473ff] sm:text-[11px] sm:tracking-[0.28em]">
                  Car Care Pricing
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                Premium care.
                <span className="ml-2 bg-gradient-to-r from-[#1473ff] via-[#3487ff] to-[#56a5ff] bg-clip-text text-transparent">
                  Clear pricing.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base">
                Choose the right level of care for your
                vehicle. Every service is completed using
                quality products and professional attention
                to detail.
              </p>
            </div>

            {/* Desktop controls */}
            {!isLoading && services.length > 1 && (
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollCards("left")}
                  aria-label="Scroll pricing cards left"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollCards("right")}
                  aria-label="Scroll pricing cards right"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="mt-10 flex gap-4 overflow-hidden pb-6 sm:mt-12 sm:gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="min-w-[88vw] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:min-w-[320px] sm:rounded-[28px] lg:min-w-[375px]"
                >
                  <div className="relative h-56 animate-pulse bg-slate-200 sm:h-60">
                    <div className="absolute left-4 top-4 h-8 w-32 rounded-full bg-slate-300/70 sm:left-5 sm:top-5" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="h-6 w-3/4 animate-pulse rounded-md bg-slate-200" />

                        <div className="mt-3 h-3 w-28 animate-pulse rounded bg-slate-100" />
                      </div>

                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-6 flex items-end gap-2">
                      <div className="h-4 w-8 animate-pulse rounded bg-blue-100" />

                      <div className="h-9 w-36 animate-pulse rounded-md bg-slate-200" />
                    </div>

                    <div className="mt-7 h-5 w-28 animate-pulse rounded bg-blue-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && errorMessage && (
            <div className="mt-10 rounded-[24px] border border-red-200 bg-red-50 px-5 py-10 text-center sm:mt-12 sm:p-10">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void fetchServices()}
                className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading &&
            !errorMessage &&
            services.length === 0 && (
              <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-5 py-14 text-center sm:mt-12 sm:rounded-[28px] sm:px-6 sm:py-16">
                <Sparkles
                  size={38}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-semibold text-slate-800">
                  No services available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Car care services have not been added yet.
                  Please check again later.
                </p>
              </div>
            )}

          {/* Pricing carousel */}
          {!isLoading &&
            !errorMessage &&
            services.length > 0 && (
              <>
                <div
                  ref={scrollContainerRef}
                  className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12 sm:gap-5"
                >
                  {visibleItems.map((item) => (
                    <article
                      key={item.id}
                      className="group relative min-w-[88vw] snap-start overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_25px_65px_rgba(20,115,255,0.14)] sm:min-w-[320px] sm:rounded-[28px] lg:min-w-[375px]"
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden bg-slate-50 sm:h-60">
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={(event) => {
                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-md sm:left-5 sm:top-5">
                          <Sparkles
                            size={13}
                            className="text-[#1473ff]"
                          />

                          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-[10px] sm:tracking-[0.17em]">
                            Premium Care
                          </span>
                        </div>

                        <div className="absolute inset-0 hidden items-center justify-center bg-white/10 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 sm:flex">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItem(item)
                            }
                            aria-label={`View ${item.title}`}
                            className="flex h-14 w-14 cursor-pointer scale-75 items-center justify-center rounded-full bg-[#1473ff] text-white opacity-0 shadow-[0_14px_35px_rgba(20,115,255,0.35)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 hover:bg-[#0f66e8]"
                          >
                            <Eye size={21} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                              {item.title}
                            </h3>

                            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
                              Starting from
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItem(item)
                            }
                            aria-label={`Open ${item.title} details`}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff]"
                          >
                            <ArrowRight size={17} />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-end gap-2">
                          <span className="pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1473ff]">
                            LKR
                          </span>

                          <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                            {formatPrice(item.price)} /=
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedItem(item)
                          }
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
                  <div className="mt-8 flex justify-center sm:mt-9">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAll(
                          (current) => !current,
                        )
                      }
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-6 text-sm font-semibold text-[#1473ff] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md sm:px-7"
                    >
                      {showAll
                        ? "Show Less"
                        : "View More"}

                      <ArrowRight
                        size={17}
                        className={`transition-transform duration-300 ${
                          showAll
                            ? "-rotate-90"
                            : ""
                        }`}
                      />
                    </button>
                  </div>
                )}
              </>
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
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5 lg:p-6"
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="relative max-h-[94svh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:max-h-[92svh] sm:rounded-[30px]"
          >
            {/* Modal background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[28px] sm:rounded-[30px]">
              <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-100/70 blur-[100px]" />
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close pricing details"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur-md transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] sm:right-5 sm:top-5"
            >
              <X size={20} />
            </button>

            <div className="relative grid lg:grid-cols-[0.95fr_1.05fr]">
              {/* Modal image */}
              <div className="relative min-h-[240px] overflow-hidden rounded-t-[28px] bg-slate-100 sm:min-h-[320px] sm:rounded-t-[30px] lg:min-h-[500px] lg:rounded-l-[30px] lg:rounded-tr-none">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  onError={(event) => {
                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white" />

                <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm backdrop-blur-md sm:bottom-5 sm:left-5 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  Professional Auto Care
                </div>
              </div>

              {/* Modal content */}
              <div className="relative flex flex-col justify-center p-5 pb-10 sm:p-8 lg:p-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-gradient-to-r from-[#1473ff] to-transparent sm:w-9" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1473ff] sm:text-[10px] sm:tracking-[0.25em]">
                    Service Details
                  </span>
                </div>

                <h3
                  id="pricing-modal-title"
                  className="pr-10 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
                >
                  {selectedItem.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base">
                  {selectedItem.description}
                </p>

                <div className="my-6 h-px bg-gradient-to-r from-slate-200 via-blue-200 to-transparent sm:my-7" />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">
                    Starting price
                  </p>

                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <span className="pb-1.5 text-sm font-semibold text-[#1473ff]">
                      LKR
                    </span>

                    <span className="text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                      {formatPrice(selectedItem.price)} /=
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}