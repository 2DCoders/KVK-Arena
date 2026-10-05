import pastryImg from "@/assets/pastry.png";
import CoffeeImg from "@/assets/coffee.png";
import { ArrowUpRight, Check, Coffee, Croissant, X } from "lucide-react";
import { useEffect, useState } from "react";

type CafeFeature = "coffee" | "pastries";

const featureContent = {
  coffee: {
    eyebrow: "Freshly brewed",
    title: "Coffee, made your way",
    description:
      "From smooth lattes to bold espresso, every cup is prepared with balance, aroma and care.",
    image: CoffeeImg,
    icon: Coffee,
    details: [
      "Espresso, latte and cappuccino favourites",
      "Carefully selected beans with a balanced finish",
      "Prepared fresh after every order",
    ],
  },
  pastries: {
    eyebrow: "Baked with care",
    title: "Fresh pastries, warm moments",
    description:
      "Discover soft, flaky and irresistible pastries prepared to pair perfectly with your favourite drink.",
    image: pastryImg,
    icon: Croissant,
    details: [
      "Flaky pastries and buttery baked favourites",
      "Freshly prepared for a soft, satisfying finish",
      "Perfectly paired with coffee or tea",
    ],
  },
} satisfies Record<CafeFeature, object>;

export default function CafeAdds1() {
  const [activeFeature, setActiveFeature] = useState<CafeFeature | null>(null);

  useEffect(() => {
    if (!activeFeature) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveFeature(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeFeature]);

  const selectedFeature = activeFeature ? featureContent[activeFeature] : null;

  return (
    <section className="bg-[#21130c] text-white">
      {/* Intro content */}
      <div className="mx-auto flex min-h-75 w-full max-w-7xl items-center justify-center px-5 py-16 text-center sm:min-h-85 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#d3a06b]/25 bg-[#d3a06b]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#e8bb89]">
            Crafted for every moment
          </span>

          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
            Experience the perfect blend of
            <span className="block text-[#e2ad75]">
              specialty coffee and fresh pastries.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#d8c8bc] sm:text-base">
            Enjoy carefully brewed coffee and freshly prepared pastries,
            created with quality ingredients to make every visit feel special.
          </p>
        </div>
      </div>

      {/* Feature images */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Coffee card */}
        <div
          className="group relative min-h-105 overflow-hidden sm:min-h-110 lg:min-h-117.5"
        >
          <img
            src={CoffeeImg}
            alt="Specialty coffee collection"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/95 via-[#24130b]/35 to-transparent" />
          <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/5" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col cursor-pointer items-start gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-5" onClick={() => setActiveFeature("coffee")}>
              <div className="max-w-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <Coffee className="h-5 w-5 text-[#f0bd84]" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e4b27d]">
                  Freshly brewed
                </p>

                <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Coffee
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                  From smooth lattes to bold espresso, every cup is prepared
                  with balance, aroma and care.
                </p>
              </div>

              <button
                type="button"
                aria-label="Open coffee details"                
                className="flex h-12 w-12 shrink-0 cursor-pointer self-end items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#dfa563] group-hover:text-[#2b170c] sm:self-auto"
              >
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pastry card */}
        <div
          className="group relative min-h-105 overflow-hidden sm:min-h-110 lg:min-h-117.5"
        >
          <img
            src={pastryImg}
            alt="Fresh pastries and desserts"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/95 via-[#24130b]/35 to-transparent" />
          <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/5" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col cursor-pointer items-start gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-5" onClick={() => setActiveFeature("pastries")}>
              <div className="max-w-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <Croissant className="h-5 w-5 text-[#f0bd84]" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e4b27d]">
                  Baked with care
                </p>

                <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Pastries
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                  Discover soft, flaky and irresistible pastries prepared to
                  pair perfectly with your favourite drink.
                </p>
              </div>

              <button
                type="button"
                aria-label="Open pastry details"                
                className="flex h-12 w-12 shrink-0 cursor-pointer self-end items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#dfa563] group-hover:text-[#2b170c] sm:self-auto"
              >
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedFeature && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110905]/90 p-3 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cafe-feature-title"
          onMouseDown={() => setActiveFeature(null)}
        >
          <div
            className="relative flex max-h-[min(900px,94vh)] w-full max-w-6xl flex-col overflow-y-auto rounded-[2rem] border border-[#e1a46d]/20 bg-[#21130c] shadow-[0_30px_100px_rgba(0,0,0,0.65)] lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close details"
              onClick={() => setActiveFeature(null)}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-[#d99a63] hover:text-[#21130c]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative min-h-65 overflow-hidden sm:min-h-85 lg:min-h-full">
              <img
                src={selectedFeature.image}
                alt={selectedFeature.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#21130c] via-[#21130c]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#21130c]" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 sm:bottom-8 sm:left-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-[#f0bd84] backdrop-blur-md">
                  <selectedFeature.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0bd84]">
                  {selectedFeature.eyebrow}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e4b27d]">
                {selectedFeature.eyebrow}
              </p>
              <h3
                id="cafe-feature-title"
                className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
              >
                {selectedFeature.title}
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#d8c8bc] sm:text-base">
                {selectedFeature.description}
              </p>

              <div className="mt-8 space-y-3">
                {selectedFeature.details.map((detail) => (
                  <div key={detail} className="flex items-start gap-3 text-sm text-[#eee0d5]">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#e2ad75]" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="mt-10 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#d99a63] px-5 py-3 text-sm font-bold text-[#21130c] transition hover:bg-[#efb47e]"
              >
                Continue exploring
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}