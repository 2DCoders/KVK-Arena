import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import IMG from "@/assets/quality.png";

interface PackageService {
  id: number;
  name: string;
  separatePrice: number;
}

interface CarwashPackage {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  packagePrice: number;
  services: PackageService[];
  isPopular?: boolean;
}

const packages: CarwashPackage[] = [
  {
    id: 1,
    name: "Essential Clean",
    shortDescription: "A quick and reliable refresh for everyday driving.",
    description:
      "The Essential Clean package covers the most important cleaning services needed to keep your vehicle fresh and presentable. It is ideal for regular maintenance and everyday vehicle care.",
    image: IMG,
    packagePrice: 3500,
    services: [
      {
        id: 1,
        name: "Premium Exterior Wash",
        separatePrice: 2500,
      },
      {
        id: 2,
        name: "Interior Vacuum",
        separatePrice: 1800,
      },
      {
        id: 3,
        name: "Tyre and Wheel Cleaning",
        separatePrice: 1000,
      },
    ],
  },
  {
    id: 2,
    name: "Complete Care",
    shortDescription: "Interior and exterior care with a premium finish.",
    description:
      "The Complete Care package combines detailed interior cleaning with professional exterior care. It is designed for customers who want a thorough clean and a noticeably improved finish.",
    image: IMG,
    packagePrice: 7500,
    services: [
      {
        id: 1,
        name: "Premium Exterior Wash",
        separatePrice: 2500,
      },
      {
        id: 2,
        name: "Interior Vacuum",
        separatePrice: 1800,
      },
      {
        id: 3,
        name: "Dashboard and Interior Cleaning",
        separatePrice: 2200,
      },
      {
        id: 4,
        name: "Tyre and Wheel Cleaning",
        separatePrice: 1200,
      },
      {
        id: 5,
        name: "Exterior Wax Finish",
        separatePrice: 2500,
      },
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "Gloss Protection",
    shortDescription: "Restore shine and protect your vehicle's paintwork.",
    description:
      "The Gloss Protection package is focused on restoring the appearance of your vehicle while adding a protective finish. It helps reduce light paint imperfections and improves overall shine.",
    image: IMG,
    packagePrice: 13500,
    services: [
      {
        id: 1,
        name: "Premium Exterior Wash",
        separatePrice: 2500,
      },
      {
        id: 2,
        name: "Cut and Polish",
        separatePrice: 12000,
      },
      {
        id: 3,
        name: "Tyre and Wheel Treatment",
        separatePrice: 1800,
      },
      {
        id: 4,
        name: "Protective Wax Finish",
        separatePrice: 3500,
      },
    ],
  },
  {
    id: 4,
    name: "Ultimate Detail",
    shortDescription: "Our most complete vehicle restoration package.",
    description:
      "The Ultimate Detail package provides comprehensive interior and exterior treatment. It is suitable for vehicles that need deeper cleaning, paint enhancement and long-lasting visual improvement.",
    image: IMG,
    packagePrice: 22000,
    services: [
      {
        id: 1,
        name: "Premium Exterior Wash",
        separatePrice: 2500,
      },
      {
        id: 2,
        name: "Complete Interior Detailing",
        separatePrice: 8500,
      },
      {
        id: 3,
        name: "Cut and Polish",
        separatePrice: 12000,
      },
      {
        id: 4,
        name: "Engine Bay Cleaning",
        separatePrice: 4000,
      },
      {
        id: 5,
        name: "Tyre and Wheel Treatment",
        separatePrice: 1800,
      },
      {
        id: 6,
        name: "Premium Protective Wax",
        separatePrice: 4500,
      },
    ],
  },
];

export default function CarwashPackages() {
  const [selectedPackage, setSelectedPackage] = useState<CarwashPackage | null>(
    null,
  );

  const [showAll, setShowAll] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visiblePackages = showAll ? packages : packages.slice(0, 10);
  const hasMorePackages = packages.length > 10;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK").format(price);

  const getSeparateTotal = (item: CarwashPackage) =>
    item.services.reduce((total, service) => total + service.separatePrice, 0);

  const getDiscountAmount = (item: CarwashPackage) =>
    Math.max(getSeparateTotal(item) - item.packagePrice, 0);

  const getDiscountPercentage = (item: CarwashPackage) => {
    const separateTotal = getSeparateTotal(item);
    const discount = getDiscountAmount(item);

    if (separateTotal === 0) {
      return 0;
    }

    return Math.round((discount / separateTotal) * 100);
  };

  const scrollPackages = (direction: "left" | "right") => {
    scrollContainerRef.current?.scrollBy({
      left: direction === "left" ? -370 : 370,
      behavior: "smooth",
    });
  };

  const scrollToContact = () => {
    setSelectedPackage(null);

    window.setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    document.body.style.overflow = selectedPackage ? "hidden" : "";

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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <section
        id="packages"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#ffffff_100%)] py-20 sm:py-24 lg:py-28"
      >
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-100/70 blur-[120px]" />

          <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-sky-100/60 blur-[120px]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          {/* Section header */}
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-[#1473ff] to-transparent" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1473ff]">
                  Car Wash Packages
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-5xl">
                More care.
                <span className="ml-2 bg-gradient-to-r from-[#1473ff] via-[#3688ff] to-[#64b5ff] bg-clip-text text-transparent">
                  Better value.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Save more by combining essential car care services into one
                professionally designed package.
              </p>
            </div>

            {/* Scroll controls */}
            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollPackages("left")}
                aria-label="Scroll packages left"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => scrollPackages("right")}
                aria-label="Scroll packages right"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff] hover:shadow-md"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* Package carousel */}
          <div
            ref={scrollContainerRef}
            className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12"
          >
            {visiblePackages.map((item) => {
              const separateTotal = getSeparateTotal(item);
              const discountAmount = getDiscountAmount(item);
              const discountPercentage = getDiscountPercentage(item);

              return (
                <article
                  key={item.id}
                  className="group relative flex min-w-[86vw] snap-start flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(20,115,255,0.14)] sm:min-w-[350px] lg:min-w-[375px]"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-56">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-black/10" />

                    {/* Package badge */}
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                      <PackageCheck size={13} className="text-[#1473ff]" />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-700">
                        Value Package
                      </span>
                    </div>

                    {item.isPopular && (
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#1473ff] px-3 py-1.5 text-white shadow-[0_8px_22px_rgba(20,115,255,0.3)]">
                        <Sparkles size={12} />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                        Save {discountPercentage}%
                      </div>
                    )}

                    {/* Hover action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setSelectedPackage(item)}
                        aria-label={`View ${item.name} package`}
                        className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-[#1473ff] text-white opacity-0 shadow-[0_14px_35px_rgba(20,115,255,0.35)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:bg-[#0f66e8]"
                      >
                        <Eye size={21} />
                      </button>
                    </div>
                  </div>

                  {/* Package content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                        {item.name}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {item.shortDescription}
                      </p>
                    </div>

                    {/* Included services */}
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Package includes
                      </p>

                      <div className="mt-4 space-y-3">
                        {item.services.slice(0, 4).map((service) => (
                          <div
                            key={service.id}
                            className="flex items-start gap-2.5"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1473ff]">
                              <Check size={11} strokeWidth={3} />
                            </span>

                            <span className="text-sm leading-5 text-slate-600">
                              {service.name}
                            </span>
                          </div>
                        ))}

                        {item.services.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setSelectedPackage(item)}
                            className="text-sm font-semibold text-[#1473ff] transition-colors hover:text-[#0f66e8]"
                          >
                            +{item.services.length - 4} more services
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/65 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-500">
                          Separately
                        </span>

                        <span className="text-sm font-medium text-slate-400 line-through">
                          LKR {formatPrice(separateTotal)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1473ff]">
                            Package price
                          </p>

                          <div className="mt-1 flex items-end gap-1.5">
                            <span className="pb-1 text-xs font-semibold text-[#1473ff]">
                              LKR
                            </span>

                            <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                              {formatPrice(item.packagePrice)}
                            </span>
                          </div>
                        </div>

                        {discountAmount > 0 && (
                          <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-right shadow-sm">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
                              You save
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-emerald-700">
                              LKR {formatPrice(discountAmount)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(item)}
                      className="group/button cursor-pointer mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1473ff]"
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
            })}
          </div>

          {/* Mobile swipe hint */}
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400 sm:hidden">
            <ChevronLeft size={14} />
            <span>Swipe to explore packages</span>
            <ChevronRight size={14} />
          </div>

          {/* View more */}
          {hasMorePackages && (
            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-7 text-sm font-semibold text-[#1473ff] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
              >
                {showAll ? "Show Less" : "View More Packages"}

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

      {/* Package details modal */}
      {selectedPackage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="package-modal-title"
          onClick={() => setSelectedPackage(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
        relative
        flex
        max-h-[94svh]
        w-full
        max-w-5xl
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-[0_30px_100px_rgba(15,23,42,0.3)]
        sm:rounded-[32px]
        lg:h-[min(760px,90svh)]
      "
          >
            {/* Background effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[32px]">
              <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/60 blur-[110px]" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedPackage(null)}
              aria-label="Close package details"
              className="
              cursor-pointer
          absolute right-4 top-4 z-30
          flex h-10 w-10 items-center justify-center
          rounded-full border border-slate-200
          bg-white/90 text-slate-600
          shadow-sm backdrop-blur-md
          transition-all duration-300
          hover:border-blue-200
          hover:bg-blue-50
          hover:text-[#1473ff]
          sm:right-5 sm:top-5
        "
            >
              <X size={20} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
              {/* Fixed image side */}
              <div
                className="
            relative
            h-[270px]
            shrink-0
            overflow-hidden
            bg-slate-100
            sm:h-[340px]
            lg:sticky
            lg:top-0
            lg:h-full
            lg:min-h-0
            lg:self-stretch
          "
              >
                <img
                  src={selectedPackage.image}
                  alt={selectedPackage.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Image overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />

                <div className="absolute inset-0 bg-blue-600/[0.03]" />

                {/* Top badge */}
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white shadow-lg backdrop-blur-xl">
                  <PackageCheck size={15} />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Premium Package
                  </span>
                </div>

                {/* Image bottom details */}
                <div className="absolute inset-x-5 bottom-5">
                  <div className="rounded-2xl border border-white/15 bg-black/45 p-4 text-white shadow-lg backdrop-blur-xl">
                    <p className="text-lg font-semibold">
                      {selectedPackage.name}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/70">
                      Professional vehicle care using quality products and
                      detailed finishing.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                        {selectedPackage.services.length} Services
                      </span>

                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                        Save {getDiscountPercentage(selectedPackage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable right side */}
              <div
                className="
            relative
            min-h-0
            bg-white
            lg:h-full
            lg:overflow-y-auto
            lg:[scrollbar-color:#cbd5e1_transparent]
            lg:[scrollbar-width:thin]
          "
              >
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Heading */}
                  <div className="flex items-center gap-3">
                    <span className="h-px w-9 bg-gradient-to-r from-[#1473ff] to-transparent" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#1473ff]">
                      Full Package Details
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 pr-10">
                    <h3
                      id="package-modal-title"
                      className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl"
                    >
                      {selectedPackage.name}
                    </h3>

                    {selectedPackage.isPopular && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1473ff]">
                        <Sparkles size={13} />
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                    {selectedPackage.description}
                  </p>

                  {/* Pricing summary */}
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Separate total
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-500 line-through sm:text-lg">
                        LKR {formatPrice(getSeparateTotal(selectedPackage))}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1473ff]">
                        Package price
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-950 sm:text-xl">
                        LKR {formatPrice(selectedPackage.packagePrice)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                        Total saving
                      </p>

                      <p className="mt-2 text-lg font-bold text-emerald-700 sm:text-xl">
                        LKR {formatPrice(getDiscountAmount(selectedPackage))}
                      </p>
                    </div>
                  </div>

                  {/* Included services heading */}
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Included services
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Individual prices are shown for comparison.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {selectedPackage.services.length} services
                    </span>
                  </div>

                  {/* Services list */}
                  <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {selectedPackage.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1473ff]">
                            <Check size={16} strokeWidth={2.5} />
                          </span>

                          <span className="text-sm font-medium leading-5 text-slate-700">
                            {service.name}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Separately
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-700">
                            LKR {formatPrice(service.separatePrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Saving callout */}
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Tag size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Save {getDiscountPercentage(selectedPackage)}% with this
                        package
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                        Compared with purchasing each included service
                        separately.
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  {/* <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={scrollToContact}
                      className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#1473ff] px-7 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(20,115,255,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f66e8] hover:shadow-[0_18px_42px_rgba(20,115,255,0.36)]"
                    >
                      Select Package
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                    <div className="flex items-center justify-center gap-2 px-2 text-xs text-slate-500 sm:justify-start">
                      <BadgeCheck size={16} className="text-[#1473ff]" />
                      Professional care and quality products
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
