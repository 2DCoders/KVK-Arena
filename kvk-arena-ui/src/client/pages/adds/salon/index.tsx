export default function SalonAdd1() {
  return (
    <section className="w-full bg-[#f8f7f4] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1380px]">
        {/* =========================================
                            HEADER
        ========================================= */}
        <div className="mx-auto mb-14 max-w-[800px] text-center sm:mb-16 lg:mb-20">
          <div className="mb-7 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#10141c]/40" />

            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#10141c]/70">
              Our Services
            </span>

            <span className="h-px w-12 bg-[#10141c]/40" />
          </div>

          <h2 className="font-sans text-[48px] font-medium leading-[0.92] tracking-[-0.055em] text-[#10141c] sm:text-[62px] lg:text-[78px]">
            Pamper Yourself
            <br />
            <span className="text-[#10141c]/75">with Our Expert</span>
            <br />
            Services
          </h2>

          <p className="mx-auto mt-8 max-w-[650px] text-[15px] leading-6 text-[#526070] sm:text-base">
            Discover a refined collection of beauty and grooming experiences,
            carefully crafted to help you look your best and feel even better.
          </p>
        </div>

        {/* =========================================
            SERVICES GRID
        ========================================= */}
        <div
          className="
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2

            lg:grid-cols-4
            lg:grid-rows-[175px_175px]
          "
        >
          {/* =====================================
              01 — LARGE LEFT IMAGE
          ===================================== */}
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]

              md:col-span-1

              lg:col-span-1
              lg:row-span-2
            "
          >
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=90"
              alt="Hair styling"
              className="
                h-[500px]
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.04]

                lg:h-full
              "
            />

            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {/* Number */}
            <div
              className="
                absolute
                right-5
                top-5
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-white/10
                text-xs
                font-medium
                text-white
                backdrop-blur-md
              "
            >
              01
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 lg:p-8">
              <h3 className="text-2xl font-medium tracking-[-0.025em] text-white sm:text-[26px]">
                Hair Styling & Cutting
              </h3>

              <p className="mt-3 max-w-[390px] text-sm leading-6 text-white/75">
                Precision cuts, trendy styles, and expert coloring tailored to
                your look. From modern haircuts to luxurious treatments.
              </p>
            </div>
          </div>

          {/* =====================================
              02 — TOP MIDDLE DARK CARD
          ===================================== */}
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]
              bg-[#292929]

              md:col-span-1

              lg:col-span-1
              lg:row-span-1
            "
          >
            {/* Optional subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />

            {/* Number */}
            <div
              className="
                absolute
                right-5
                top-5
                z-10
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-white/[0.08]
                text-xs
                font-medium
                text-white
              "
            >
              02
            </div>

            <div className="relative flex h-full flex-col justify-center p-7 sm:p-8">
              <h3 className="text-xl font-medium tracking-[-0.02em] text-white sm:text-[22px]">
                Hair Styling & Cutting
              </h3>

              <p className="mt-3 max-w-[360px] text-xs leading-5 text-white/65 sm:text-[13px]">
                Precision cuts, trendy styles, and expert coloring tailored to
                your look. From trendy haircuts and luxurious spa treatments to
                flawless makeup and precise nail care.
              </p>

              {/* Small decorative line */}
              <div className="mt-5 h-px w-12 bg-white/30 transition-all duration-500 group-hover:w-20" />
            </div>
          </div>

          {/* =====================================
              03 — TOP RIGHT IMAGE
          ===================================== */}
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]

              md:col-span-1

              lg:col-span-2
              lg:row-span-1
            "
          >
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=90"
              alt="Hair wash"
              className="
                h-[300px]
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.04]

                lg:h-full
              "
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

            {/* Number */}
            <div
              className="
                absolute
                right-5
                top-5
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-white/10
                text-xs
                font-medium
                text-white
                backdrop-blur-md
              "
            >
              03
            </div>

            <div className="absolute bottom-0 left-0 p-7">
              <h3 className="text-2xl font-medium tracking-[-0.025em] text-white">
                Relaxing Hair Wash
              </h3>
            </div>
          </div>

          {/* =====================================
              04 — WIDE BOTTOM IMAGE
          ===================================== */}
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]

              md:col-span-2

              lg:col-span-3
              lg:row-span-1
            "
          >
            <img
              src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=90"
              alt="Premium grooming"
              className="
                h-[300px]
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.04]

                lg:h-full
              "
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />

            {/* Number */}
            <div
              className="
                absolute
                right-5
                top-5
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-white/10
                text-xs
                font-medium
                text-white
                backdrop-blur-md
              "
            >
              04
            </div>

            <div className="absolute bottom-0 left-0 max-w-[600px] p-7 sm:p-8">
              <h3 className="text-2xl font-medium tracking-[-0.025em] text-white sm:text-[28px]">
                Premium Grooming
              </h3>

              <p className="mt-2 max-w-[520px] text-sm leading-6 text-white/75">
                Professional grooming and styling designed around your personal
                look, with attention to every detail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
