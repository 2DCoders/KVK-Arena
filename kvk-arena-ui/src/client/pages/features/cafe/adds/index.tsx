import pastryImg from "@/assets/pastry.png";
import CoffeeImg from "@/assets/coffee.png";
import { ArrowUpRight, Coffee, Croissant } from "lucide-react";

export default function CafeAdds1() {
  return (
    <section className="bg-[#21130c] text-white">
      {/* Intro content */}
      <div className="mx-auto flex min-h-[340px] w-full max-w-7xl items-center justify-center px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-24">
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
      <div className="grid min-h-[430px] grid-cols-1 lg:grid-cols-2">
        {/* Coffee card */}
        <a
          href="#coffee"
          className="group relative min-h-[380px] overflow-hidden lg:min-h-[470px]"
        >
          <img
            src={CoffeeImg}
            alt="Specialty coffee collection"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/95 via-[#24130b]/35 to-transparent" />
          <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/5" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex items-end justify-between gap-5">
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

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#dfa563] group-hover:text-[#2b170c]">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </a>

        {/* Pastry card */}
        <a
          href="#pastries"
          className="group relative min-h-[380px] overflow-hidden lg:min-h-[470px]"
        >
          <img
            src={pastryImg}
            alt="Fresh pastries and desserts"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/95 via-[#24130b]/35 to-transparent" />
          <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/5" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex items-end justify-between gap-5">
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

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#dfa563] group-hover:text-[#2b170c]">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}