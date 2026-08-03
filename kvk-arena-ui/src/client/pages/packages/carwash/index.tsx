import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  PackageCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import IMG from "@/assets/quality.png";
import { getCarPackages } from "@/services/car-service-api";

/* =========================================================
   API RESPONSE TYPES
========================================================= */

interface CarServiceApiResponse {
  id: string;
  title: string;
  durationInMinutes: number;
  serviceCategory: number;
  description: string;
  price: number;
  image: string | null;
  features: string | null;
}

interface CarPackageApiResponse {
  id: string;
  title: string;
  description: string;
  durationInMinutes: number;
  image: string | null;

  // This matches your API response exactly.
  basPrice: number;

  pricesWithoutDiscounts: number;
  isActive: boolean;
  services: CarServiceApiResponse[];
}

/* =========================================================
   FRONTEND TYPES
========================================================= */

interface PackageService {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
  serviceCategory: number;
  separatePrice: number;
  image: string;
  features: string[];
}

interface CarwashPackage {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  durationInMinutes: number;
  image: string;
  packagePrice: number;
  pricesWithoutDiscounts: number;
  isActive: boolean;
  services: PackageService[];
}

/* =========================================================
   HELPERS
========================================================= */

const parseFeatures = (
  features: string | null | undefined,
): string[] => {
  if (!features?.trim()) {
    return [];
  }

  return features
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
};

const getImageSource = (
  image: string | null | undefined,
  fallbackImage: string,
): string => {
  if (!image?.trim()) {
    return fallbackImage;
  }

  const value = image.trim();

  // Base64 JPEG
  if (value.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${value}`;
  }

  // Base64 PNG
  if (value.startsWith("iVBOR")) {
    return `data:image/png;base64,${value}`;
  }

  // Base64 GIF
  if (value.startsWith("R0lGOD")) {
    return `data:image/gif;base64,${value}`;
  }

  // Base64 WebP
  if (value.startsWith("UklGR")) {
    return `data:image/webp;base64,${value}`;
  }

  // Already formatted image or URL
  if (
    value.startsWith("data:image/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `data:image/jpeg;base64,${value}`;
};

const extractPackages = (
  response: unknown,
): CarPackageApiResponse[] => {
  if (Array.isArray(response)) {
    return response as CarPackageApiResponse[];
  }

  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    const data = (response as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return data as CarPackageApiResponse[];
    }
  }

  return [];
};

const getShortDescription = (
  description: string,
  maximumLength = 115,
): string => {
  if (!description?.trim()) {
    return "Professional vehicle cleaning and care package.";
  }

  if (description.length <= maximumLength) {
    return description;
  }

  return `${description.slice(0, maximumLength).trim()}...`;
};

const formatDuration = (durationInMinutes: number): string => {
  if (!durationInMinutes || durationInMinutes <= 0) {
    return "Duration varies";
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${minutes} min`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CarwashPackages() {
  const [packages, setPackages] = useState<CarwashPackage[]>([]);

  const [selectedPackage, setSelectedPackage] =
    useState<CarwashPackage | null>(null);

  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visiblePackages = showAll
    ? packages
    : packages.slice(0, 10);

  const hasMorePackages = packages.length > 10;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK").format(
      Number.isFinite(price) ? price : 0,
    );

  const getSeparateTotal = (item: CarwashPackage) => {
    if (item.pricesWithoutDiscounts > 0) {
      return item.pricesWithoutDiscounts;
    }

    return item.services.reduce(
      (total, service) => total + service.separatePrice,
      0,
    );
  };

  const getDiscountAmount = (item: CarwashPackage) =>
    Math.max(
      getSeparateTotal(item) - item.packagePrice,
      0,
    );

  const getDiscountPercentage = (item: CarwashPackage) => {
    const separateTotal = getSeparateTotal(item);

    if (separateTotal <= 0) {
      return 0;
    }

    return Math.round(
      (getDiscountAmount(item) / separateTotal) * 100,
    );
  };

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getCarPackages();
      const apiPackages = extractPackages(response);

      const mappedPackages: CarwashPackage[] = apiPackages
        .filter((item) => item.isActive)
        .map((item) => ({
          id: item.id,

          name:
            item.title?.trim() ||
            "Unnamed Package",

          shortDescription: getShortDescription(
            item.description,
          ),

          description:
            item.description?.trim() ||
            "Professional vehicle cleaning and care package.",

          durationInMinutes:
            Number(item.durationInMinutes) || 0,

          image: getImageSource(item.image, IMG),

          packagePrice:
            Number(item.basPrice) || 0,

          pricesWithoutDiscounts:
            Number(item.pricesWithoutDiscounts) || 0,

          isActive: Boolean(item.isActive),

          services: Array.isArray(item.services)
            ? item.services.map((service) => ({
                id: service.id,

                name:
                  service.title?.trim() ||
                  "Unnamed Service",

                description:
                  service.description?.trim() ||
                  "Service details are not available.",

                durationInMinutes:
                  Number(service.durationInMinutes) || 0,

                serviceCategory:
                  Number(service.serviceCategory) || 0,

                separatePrice:
                  Number(service.price) || 0,

                image: getImageSource(
                  service.image,
                  IMG,
                ),

                features: parseFeatures(
                  service.features,
                ),
              }))
            : [],
        }));

      setPackages(mappedPackages);
    } catch (error) {
      console.error(
        "Failed to load car wash packages:",
        error,
      );

      setPackages([]);

      setErrorMessage(
        "Unable to load car wash packages. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPackages();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPackage
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPackage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPackage(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const scrollPackages = (
    direction: "left" | "right",
  ) => {
    scrollContainerRef.current?.scrollBy({
      left: direction === "left" ? -390 : 390,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section
        id="packages"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#ffffff_100%)] py-16 sm:py-20 lg:py-28"
      >
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[360px] w-[360px] rounded-full bg-blue-100/70 blur-[110px] sm:h-[420px] sm:w-[420px]" />

          <div className="absolute -right-40 bottom-0 h-[360px] w-[360px] rounded-full bg-sky-100/60 blur-[110px] sm:h-[420px] sm:w-[420px]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-[#1473ff] to-transparent sm:w-10" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1473ff] sm:text-[11px] sm:tracking-[0.28em]">
                  Car Wash Packages
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-5xl">
                More care.
                <span className="ml-2 bg-gradient-to-r from-[#1473ff] via-[#3688ff] to-[#64b5ff] bg-clip-text text-transparent">
                  Better value.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base">
                Save more by combining essential car care
                services into one professionally designed
                package.
              </p>
            </div>

            {!isLoading && packages.length > 1 && (
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    scrollPackages("left")
                  }
                  aria-label="Scroll packages left"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollPackages("right")
                  }
                  aria-label="Scroll packages right"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-10 flex gap-4 overflow-hidden pb-7 sm:mt-12 sm:gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="min-w-[88vw] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm sm:min-w-[350px] sm:rounded-[28px] lg:min-w-[375px]"
                >
                  <div className="h-52 animate-pulse bg-slate-200 sm:h-56" />

                  <div className="p-5 sm:p-6">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

                    <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />

                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />

                    <div className="mt-7 space-y-3">
                      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                    </div>

                    <div className="mt-7 h-20 animate-pulse rounded-2xl bg-blue-100" />

                    <div className="mt-5 h-11 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && errorMessage && (
            <div className="mt-10 rounded-[24px] border border-red-200 bg-red-50 px-5 py-10 text-center sm:mt-12 sm:p-10">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadPackages()
                }
                className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading &&
            !errorMessage &&
            packages.length === 0 && (
              <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-5 py-14 text-center sm:mt-12 sm:rounded-[28px] sm:px-6 sm:py-16">
                <PackageCheck
                  size={38}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-semibold text-slate-800">
                  No packages available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Car wash packages have not been
                  added yet. Please check again later.
                </p>
              </div>
            )}

          {/* Packages */}
          {!isLoading &&
            !errorMessage &&
            packages.length > 0 && (
              <>
                <div
                  ref={scrollContainerRef}
                  className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12 sm:gap-5"
                >
                  {visiblePackages.map(
                    (item, packageIndex) => {
                      const separateTotal =
                        getSeparateTotal(item);

                      const discountAmount =
                        getDiscountAmount(item);

                      const discountPercentage =
                        getDiscountPercentage(item);

                      return (
                        <article
                          key={item.id}
                          className="group relative flex min-w-[88vw] snap-start flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(20,115,255,0.14)] sm:min-w-[350px] sm:rounded-[28px] lg:min-w-[375px]"
                        >
                          {/* Image */}
                          <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-56">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(event) => {
                                event.currentTarget.src =
                                  IMG;
                              }}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10" />

                            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md sm:left-4 sm:top-4">
                              <PackageCheck
                                size={13}
                                className="text-[#1473ff]"
                              />

                              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-[10px] sm:tracking-[0.17em]">
                                Value Package
                              </span>
                            </div>

                            {packageIndex === 0 && (
                              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#1473ff] px-3 py-1.5 text-white shadow-[0_8px_22px_rgba(20,115,255,0.3)] sm:right-4 sm:top-4">
                                <Sparkles size={12} />

                                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.15em]">
                                  Popular
                                </span>
                              </div>
                            )}

                            {discountPercentage >
                              0 && (
                              <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:bottom-4 sm:left-4">
                                Save{" "}
                                {
                                  discountPercentage
                                }
                                %
                              </div>
                            )}

                            {item.durationInMinutes >
                              0 && (
                              <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:bottom-4 sm:right-4">
                                <Clock3 size={12} />

                                {formatDuration(
                                  item.durationInMinutes,
                                )}
                              </div>
                            )}

                            <div className="absolute inset-0 hidden items-center justify-center bg-white/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 sm:flex">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPackage(
                                    item,
                                  )
                                }
                                aria-label={`View ${item.name} package`}
                                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#1473ff] text-white opacity-0 shadow-[0_14px_35px_rgba(20,115,255,0.35)] transition-all duration-300 group-hover:opacity-100 hover:bg-[#0f66e8]"
                              >
                                <Eye size={21} />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-1 flex-col p-5 sm:p-6">
                            <div>
                              <h3 className="text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                                {item.name}
                              </h3>

                              <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                                {
                                  item.shortDescription
                                }
                              </p>
                            </div>

                            {/* Services */}
                            <div className="mt-5 border-t border-slate-100 pt-5">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
                                  Package includes
                                </p>

                                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1473ff]">
                                  {
                                    item.services
                                      .length
                                  }{" "}
                                  services
                                </span>
                              </div>

                              {item.services.length >
                              0 ? (
                                <div className="mt-4 space-y-3">
                                  {item.services
                                    .slice(0, 4)
                                    .map(
                                      (
                                        service,
                                      ) => (
                                        <div
                                          key={
                                            service.id
                                          }
                                          className="flex items-start gap-2.5"
                                        >
                                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1473ff]">
                                            <Check
                                              size={
                                                11
                                              }
                                              strokeWidth={
                                                3
                                              }
                                            />
                                          </span>

                                          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                                            <span className="text-sm leading-5 text-slate-600">
                                              {
                                                service.name
                                              }
                                            </span>

                                            <span className="shrink-0 text-xs font-semibold text-slate-500">
                                              LKR{" "}
                                              {formatPrice(
                                                service.separatePrice,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}

                                  {item.services
                                    .length > 4 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedPackage(
                                          item,
                                        )
                                      }
                                      className="cursor-pointer text-sm font-semibold text-[#1473ff] transition-colors hover:text-[#0f66e8]"
                                    >
                                      +
                                      {item
                                        .services
                                        .length -
                                        4}{" "}
                                      more services
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-4 text-sm text-slate-400">
                                  Service details
                                  are not available.
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/65 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-500">
                                  Separately
                                </span>

                                <span className="text-sm font-medium text-slate-400 line-through">
                                  LKR{" "}
                                  {formatPrice(
                                    separateTotal,
                                  )}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-col gap-3 xs:flex-row xs:items-end xs:justify-between">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1473ff]">
                                    Package price
                                  </p>

                                  <div className="mt-1 flex items-end gap-1.5">
                                    <span className="pb-1 text-xs font-semibold text-[#1473ff]">
                                      LKR
                                    </span>

                                    <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                                      {formatPrice(
                                        item.packagePrice,
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {discountAmount >
                                  0 && (
                                  <div className="w-fit rounded-xl border border-emerald-100 bg-white px-3 py-2 text-left shadow-sm xs:text-right">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
                                      You save
                                    </p>

                                    <p className="mt-0.5 text-sm font-bold text-emerald-700">
                                      LKR{" "}
                                      {formatPrice(
                                        discountAmount,
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPackage(
                                  item,
                                )
                              }
                              className="group/button mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff]"
                            >
                              View Package

                              <ArrowRight
                                size={16}
                                className="transition-transform duration-300 group-hover/button:translate-x-1"
                              />
                            </button>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>

                <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400 sm:hidden">
                  <ChevronLeft size={14} />
                  <span>
                    Swipe to explore packages
                  </span>
                  <ChevronRight size={14} />
                </div>

                {hasMorePackages && (
                  <div className="mt-8 flex justify-center sm:mt-9">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAll(
                          (current) =>
                            !current,
                        )
                      }
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-6 text-sm font-semibold text-[#1473ff] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md sm:px-7"
                    >
                      {showAll
                        ? "Show Less"
                        : "View More Packages"}

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

      {/* Modal */}
      {selectedPackage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="package-modal-title"
          onClick={() =>
            setSelectedPackage(null)
          }
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5 lg:p-6"
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="relative flex max-h-[94svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.3)] sm:max-h-[92svh] sm:rounded-[30px] lg:h-[min(760px,90svh)] lg:rounded-[32px]"
          >
            <button
              type="button"
              onClick={() =>
                setSelectedPackage(null)
              }
              aria-label="Close package details"
              className="absolute right-3 top-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur-md transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] sm:right-5 sm:top-5"
            >
              <X size={20} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
              {/* Image side */}
              <div className="relative h-[240px] shrink-0 overflow-hidden bg-slate-100 sm:h-[330px] lg:sticky lg:top-0 lg:h-full lg:min-h-0 lg:self-stretch">
                <img
                  src={selectedPackage.image}
                  alt={selectedPackage.name}
                  onError={(event) => {
                    event.currentTarget.src =
                      IMG;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-white shadow-lg backdrop-blur-xl sm:left-5 sm:top-5 sm:px-4">
                  <PackageCheck size={15} />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] sm:text-[10px] sm:tracking-[0.18em]">
                    Premium Package
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                  <div className="rounded-2xl border border-white/15 bg-black/45 p-4 text-white shadow-lg backdrop-blur-xl">
                    <p className="pr-2 text-lg font-semibold">
                      {selectedPackage.name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.14em]">
                        {
                          selectedPackage
                            .services.length
                        }{" "}
                        Services
                      </span>

                      {getDiscountPercentage(
                        selectedPackage,
                      ) > 0 && (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.14em]">
                          Save{" "}
                          {getDiscountPercentage(
                            selectedPackage,
                          )}
                          %
                        </span>
                      )}

                      {selectedPackage.durationInMinutes >
                        0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.14em]">
                          <Clock3 size={11} />

                          {formatDuration(
                            selectedPackage.durationInMinutes,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details side */}
              <div className="relative min-h-0 bg-white lg:h-full lg:overflow-y-auto lg:[scrollbar-color:#cbd5e1_transparent] lg:[scrollbar-width:thin]">
                <div className="p-5 pb-10 sm:p-8 sm:pb-10 lg:p-10">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-gradient-to-r from-[#1473ff] to-transparent sm:w-9" />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1473ff] sm:text-[10px] sm:tracking-[0.25em]">
                      Full Package Details
                    </span>
                  </div>

                  <h3
                    id="package-modal-title"
                    className="mt-5 pr-10 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
                  >
                    {selectedPackage.name}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base">
                    {
                      selectedPackage.description
                    }
                  </p>

                  {/* Summary */}
                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px] sm:tracking-[0.16em]">
                        Separate total
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-500 line-through sm:text-lg">
                        LKR{" "}
                        {formatPrice(
                          getSeparateTotal(
                            selectedPackage,
                          ),
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1473ff] sm:text-[10px] sm:tracking-[0.16em]">
                        Package price
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-950 sm:text-xl">
                        LKR{" "}
                        {formatPrice(
                          selectedPackage.packagePrice,
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 sm:text-[10px] sm:tracking-[0.16em]">
                        Total saving
                      </p>

                      <p className="mt-2 text-lg font-bold text-emerald-700 sm:text-xl">
                        LKR{" "}
                        {formatPrice(
                          getDiscountAmount(
                            selectedPackage,
                          ),
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  {selectedPackage.durationInMinutes >
                    0 && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1473ff] shadow-sm">
                        <Clock3 size={18} />
                      </span>

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1473ff]">
                          Estimated duration
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDuration(
                            selectedPackage.durationInMinutes,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Services heading */}
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
                        Included services
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Individual prices are
                        shown for comparison.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {
                        selectedPackage.services
                          .length
                      }{" "}
                      services
                    </span>
                  </div>

                  {/* Services list */}
                  {selectedPackage.services
                    .length > 0 ? (
                    <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {selectedPackage.services.map(
                        (service) => (
                          <div
                            key={service.id}
                            className="p-4 transition-colors hover:bg-slate-50 sm:px-5"
                          >
                            <div className="flex items-start justify-between gap-3 sm:gap-4">
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1473ff]">
                                  <Check
                                    size={16}
                                    strokeWidth={
                                      2.5
                                    }
                                  />
                                </span>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold leading-5 text-slate-700">
                                    {
                                      service.name
                                    }
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                    {
                                      service.description
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px] sm:tracking-[0.14em]">
                                  Separately
                                </p>

                                <p className="mt-0.5 text-xs font-semibold text-slate-700 sm:text-sm">
                                  LKR{" "}
                                  {formatPrice(
                                    service.separatePrice,
                                  )}
                                </p>
                              </div>
                            </div>

                            {service.features
                              .length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2 pl-12">
                                {service.features.map(
                                  (
                                    feature,
                                    index,
                                  ) => (
                                    <span
                                      key={`${service.id}-${feature}-${index}`}
                                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                                    >
                                      {feature}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">
                        No services are currently
                        available for this package.
                      </p>
                    </div>
                  )}

                  {/* Saving */}
                  {getDiscountAmount(
                    selectedPackage,
                  ) > 0 && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <Tag size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          Save{" "}
                          {getDiscountPercentage(
                            selectedPackage,
                          )}
                          % with this package
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                          Compared with purchasing
                          each included service
                          separately.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}