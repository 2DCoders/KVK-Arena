import IMG from "@/assets/demo-coffee.png";
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CafeItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string[];
};

const cafeItems: CafeItem[] = [
  {
    id: 1,
    name: "Classic Espresso",
    category: "Hot Coffee",
    price: 450,
    description:
      "A rich and concentrated espresso made using carefully selected coffee beans for a bold and balanced finish.",
    ingredients: ["Premium coffee beans", "Filtered water"],
  },
  {
    id: 2,
    name: "Caffè Americano",
    category: "Hot Coffee",
    price: 520,
    description:
      "A smooth espresso combined with hot water, delivering a lighter body while preserving its rich coffee flavour.",
    ingredients: ["Espresso", "Hot water"],
  },
  {
    id: 3,
    name: "Creamy Cappuccino",
    category: "Hot Coffee",
    price: 650,
    description:
      "Freshly brewed espresso finished with steamed milk and a generous layer of silky milk foam.",
    ingredients: ["Espresso", "Steamed milk", "Milk foam"],
  },
  {
    id: 4,
    name: "Signature Latte",
    category: "Hot Coffee",
    price: 680,
    description:
      "A comforting combination of espresso and smooth steamed milk, finished with handcrafted latte art.",
    ingredients: ["Espresso", "Steamed milk", "Milk foam"],
  },
  {
    id: 5,
    name: "Chocolate Mocha",
    category: "Special Coffee",
    price: 750,
    description:
      "A luxurious blend of espresso, chocolate and steamed milk, created for coffee and chocolate lovers.",
    ingredients: ["Espresso", "Chocolate", "Steamed milk"],
  },
  {
    id: 6,
    name: "Caramel Latte",
    category: "Special Coffee",
    price: 780,
    description:
      "Smooth espresso and creamy milk enhanced with a sweet caramel flavour for a rich café favourite.",
    ingredients: ["Espresso", "Steamed milk", "Caramel"],
  },
  {
    id: 7,
    name: "Iced Americano",
    category: "Cold Coffee",
    price: 580,
    description:
      "Fresh espresso poured over chilled water and ice for a clean, bold and refreshing coffee experience.",
    ingredients: ["Espresso", "Chilled water", "Ice"],
  },
  {
    id: 8,
    name: "Iced Latte",
    category: "Cold Coffee",
    price: 720,
    description:
      "A refreshing combination of espresso, cold milk and ice with a smooth and creamy finish.",
    ingredients: ["Espresso", "Cold milk", "Ice"],
  },
  {
    id: 9,
    name: "Vanilla Cold Coffee",
    category: "Cold Coffee",
    price: 790,
    description:
      "Cold coffee blended with creamy milk and aromatic vanilla for a refreshing and flavourful drink.",
    ingredients: ["Coffee", "Cold milk", "Vanilla", "Ice"],
  },
  {
    id: 10,
    name: "Coffee Frappe",
    category: "Blended Coffee",
    price: 850,
    description:
      "A chilled blended coffee drink with a creamy texture, topped with a delicate layer of foam.",
    ingredients: ["Coffee", "Milk", "Ice", "Cream"],
  },
  {
    id: 11,
    name: "Hazelnut Latte",
    category: "Special Coffee",
    price: 820,
    description:
      "A smooth latte enriched with roasted hazelnut flavour, offering a warm and nutty finish.",
    ingredients: ["Espresso", "Steamed milk", "Hazelnut"],
  },
  {
    id: 12,
    name: "Double Espresso",
    category: "Hot Coffee",
    price: 580,
    description:
      "Two full shots of premium espresso created for customers who enjoy a stronger coffee experience.",
    ingredients: ["Double espresso shot", "Filtered water"],
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(price);

export default function CafePricing() {
  const [selectedItem, setSelectedItem] = useState<CafeItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = showAll ? cafeItems : cafeItems.slice(0, 10);

  const scrollItems = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const cardWidth =
      container.querySelector<HTMLElement>("[data-cafe-card]")?.offsetWidth ??
      300;

    container.scrollBy({
      left: direction === "left" ? -(cardWidth + 20) : cardWidth + 20,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    document.body.style.overflow = selectedItem ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedItem]);

  return (
    <>
      <section
        id="menu"
        className="relative overflow-hidden bg-[#fffaf5] py-20 sm:py-24 lg:py-28"
      >
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[#eed8c4]/45 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#f3dfca]/55 blur-[120px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          {/* Heading */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e4cbb6] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#955633] shadow-sm">
                <Coffee className="h-4 w-4" />
                Our coffee menu
              </span>

              <h2 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#29170f] sm:text-4xl lg:text-5xl">
                Crafted coffee for
                <span className="block text-[#a8663e]">
                  every kind of moment.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#78675d] sm:text-base">
                Explore our collection of freshly prepared hot, cold and
                specialty coffee drinks made with quality ingredients.
              </p>
            </div>

            {/* Desktop scroll controls */}
            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollItems("left")}
                aria-label="Scroll coffee items left"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#e4d4c7] bg-white text-[#5b3825] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#bb8a68] hover:bg-[#f8ebdf]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollItems("right")}
                aria-label="Scroll coffee items right"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#754127] text-white shadow-[0_12px_30px_rgba(117,65,39,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#925735]"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Horizontal item list */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5"
          >
            {visibleItems.map((item) => (
              <article
                key={item.id}
                data-cafe-card
                className="group w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[285px]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="block w-full text-left cursor-pointer"
                  aria-label={`View details for ${item.name}`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-[#ead8c8]">
                    <img
                      src={IMG}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#29150b]/70 via-transparent to-transparent opacity-70 transition duration-300 group-hover:opacity-90" />

                    {/* Category */}
                    <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-[#2f190e]/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                      {item.category}
                    </span>

                    {/* View button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#241209]/15 opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100">
                      <div className="flex h-14 w-14 translate-y-4 items-center justify-center rounded-full border border-white/35 bg-white/90 text-[#4d2a18] shadow-xl transition duration-300 group-hover:translate-y-0">
                        <Eye className="h-5 w-5" />
                      </div>
                    </div>

                    <span className="absolute bottom-4 right-4 translate-y-3 rounded-full border border-white/25 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#4a2817] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      View details
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="px-2 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#a16b49]">
                      {item.category}
                    </p>

                    <div className="mt-2 flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold tracking-[-0.02em] text-[#2e1b12] transition group-hover:text-[#9b5b36]">
                        {item.name}
                      </h3>

                      <p className="shrink-0 text-base font-black text-[#7f4729]">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>

          {/* Mobile scroll controls */}
          <div className="mt-3 flex items-center justify-between sm:hidden">
            <p className="text-xs font-medium text-[#89766a]">
              Swipe to explore the menu
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollItems("left")}
                aria-label="Scroll coffee items left"
                className="flex h-10 cursor-pointer w-10 items-center justify-center rounded-full border border-[#e4d4c7] bg-white text-[#5b3825]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollItems("right")}
                aria-label="Scroll coffee items right"
                className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-full bg-[#754127] text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* View more */}
          {cafeItems.length > 10 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowAll((current) => !current);

                  if (showAll) {
                    scrollContainerRef.current?.scrollTo({
                      left: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className="group inline-flex cursor-pointer items-center gap-2 border-b border-[#895033] pb-1 text-sm font-bold text-[#704027] transition hover:border-[#b47852] hover:text-[#a56540]"
              >
                {showAll
                  ? "Show fewer items"
                  : `View more items (${cafeItems.length - 10})`}

                <ArrowRight
                  className={`h-4 w-4 cursor-pointer transition-transform duration-300 ${
                    showAll ? "rotate-180" : "group-hover:translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Details modal */}
      {selectedItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cafe-item-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedItem(null);
              }
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1c0d06]/65 p-4 backdrop-blur-md sm:p-6"
          >
            <div className="relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-[#fffaf5] shadow-[0_35px_100px_rgba(22,9,3,0.4)] md:grid-cols-[0.9fr_1.1fr]">
              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close item details"
                className="absolute right-4 cursor-pointer top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#28140b]/70 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-[#28140b]"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Fixed image side */}
              <div className="relative hidden min-h-[520px] overflow-hidden md:block">
                <img
                  src={IMG}
                  alt={selectedItem.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#231107]/80 via-transparent to-[#241209]/10" />

                <div className="absolute inset-x-0 bottom-0 p-8">
                  <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    {selectedItem.category}
                  </span>

                  <p className="mt-4 text-3xl font-bold text-white">
                    {selectedItem.name}
                  </p>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8 md:p-10">
                {/* Mobile image */}
                <div className="relative mb-7 aspect-[16/10] overflow-hidden rounded-2xl md:hidden">
                  <img
                    src={IMG}
                    alt={selectedItem.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#241109]/50 to-transparent" />
                </div>

                <span className="inline-flex rounded-full bg-[#f1dfd0] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#8d5030]">
                  {selectedItem.category}
                </span>

                <h2
                  id="cafe-item-title"
                  className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#2d1a11] sm:text-4xl"
                >
                  {selectedItem.name}
                </h2>

                <p className="mt-3 text-2xl font-black text-[#925333]">
                  {formatPrice(selectedItem.price)}
                </p>

                <div className="my-7 h-px bg-[#e8d9cd]" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a16b49]">
                    Description
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#6f6057] sm:text-base">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a16b49]">
                    Ingredients
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedItem.ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="rounded-full border border-[#e3d0c0] bg-white px-3 py-2 text-sm font-medium text-[#644331]"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-[#e5d2c2] bg-[#f7e9dd] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#925333]">
                      <Coffee className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-bold text-[#3c2519]">
                        Freshly prepared
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#796459]">
                        Every drink is prepared after ordering to ensure the
                        best possible flavour and quality.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="mt-8 cursor-pointer inline-flex w-full items-center justify-center rounded-full bg-[#754127] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,65,39,0.2)] transition hover:-translate-y-0.5 hover:bg-[#925735]"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}