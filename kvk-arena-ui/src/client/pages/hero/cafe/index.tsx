import {
  ArrowRight,
  Clock3,
  Coffee,
  MapPin,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const FRAME_COUNT = 283;

const MAP_URL =
  "https://maps.app.goo.gl/D9vcmL5WoNeubk1KA";

const clamp = (
  value: number,
  min: number,
  max: number,
) => {
  return Math.min(
    Math.max(value, min),
    max,
  );
};

const easeInOut = (value: number) => {
  const progress = clamp(value, 0, 1);

  return progress < 0.5
    ? 2 * progress * progress
    : 1 -
        Math.pow(-2 * progress + 2, 2) /
          2;
};

const getRangeProgress = (
  scrollProgress: number,
  start: number,
  end: number,
) => {
  return clamp(
    (scrollProgress - start) /
      (end - start),
    0,
    1,
  );
};

const getFramePath = (
  frameIndex: number,
) => {
  const frameNumber = String(
    frameIndex + 1,
  ).padStart(3, "0");

  return `/cafe-sequence/ezgif-frame-${frameNumber}.png`;
};

export default function CafeHero() {
  const sectionRef =
    useRef<HTMLElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const imagesRef =
    useRef<HTMLImageElement[]>([]);

  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animationFrameRef =
    useRef<number | null>(null);

  const [loadingProgress, setLoadingProgress] =
    useState(0);

  const [isReady, setIsReady] =
    useState(false);

  const [scrollProgress, setScrollProgress] =
    useState(0);

  const scrollToMenu = () => {
    document
      .getElementById("menu")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const image =
        imagesRef.current[frameIndex];

      if (
        !canvas ||
        !image ||
        !image.complete ||
        image.naturalWidth === 0
      ) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (!context) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      const canvasWidth = Math.floor(
        width * pixelRatio,
      );

      const canvasHeight = Math.floor(
        height * pixelRatio,
      );

      if (
        canvas.width !== canvasWidth ||
        canvas.height !== canvasHeight
      ) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      );

      context.clearRect(
        0,
        0,
        width,
        height,
      );

      const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

      const canvasRatio =
        width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawHeight = height;
        drawWidth =
          height * imageRatio;
        offsetX =
          (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight =
          width / imageRatio;
        offsetY =
          (height - drawHeight) / 2;
      }

      context.imageSmoothingEnabled =
        true;

      context.imageSmoothingQuality =
        "high";

      context.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );
    },
    [],
  );

  const animateFrame = useCallback(() => {
    const current =
      currentFrameRef.current;

    const target =
      targetFrameRef.current;

    const difference = target - current;

    if (Math.abs(difference) < 0.05) {
      currentFrameRef.current = target;

      drawFrame(
        Math.round(
          currentFrameRef.current,
        ),
      );

      animationFrameRef.current = null;
      return;
    }

    currentFrameRef.current +=
      difference * 0.14;

    drawFrame(
      clamp(
        Math.round(
          currentFrameRef.current,
        ),
        0,
        FRAME_COUNT - 1,
      ),
    );

    animationFrameRef.current =
      window.requestAnimationFrame(
        animateFrame,
      );
  }, [drawFrame]);

  useEffect(() => {
    let cancelled = false;
    let loadedFrames = 0;

    const images: HTMLImageElement[] =
      [];

    const updateLoading = () => {
      loadedFrames += 1;

      const progress = Math.round(
        (loadedFrames / FRAME_COUNT) *
          100,
      );

      if (!cancelled) {
        setLoadingProgress(progress);
      }

      if (
        loadedFrames === FRAME_COUNT &&
        !cancelled
      ) {
        imagesRef.current = images;
        setIsReady(true);

        window.requestAnimationFrame(
          () => {
            drawFrame(0);
          },
        );
      }
    };

    for (
      let index = 0;
      index < FRAME_COUNT;
      index += 1
    ) {
      const image = new Image();

      image.src = getFramePath(index);
      image.decoding = "async";

      image.onload = updateLoading;
      image.onerror = updateLoading;

      images.push(image);
    }

    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  useEffect(() => {
    if (!isReady) return;

    let ticking = false;

    const updateScrollProgress = () => {
      const section =
        sectionRef.current;

      if (!section) {
        ticking = false;
        return;
      }

      const sectionTop =
        section.offsetTop;

      const scrollableDistance =
        Math.max(
          section.offsetHeight -
            window.innerHeight,
          1,
        );

      const currentProgress = clamp(
        (window.scrollY - sectionTop) /
          scrollableDistance,
        0,
        1,
      );

      setScrollProgress(
        currentProgress,
      );

      const targetFrame = Math.min(
        FRAME_COUNT - 1,
        Math.floor(
          currentProgress *
            FRAME_COUNT,
        ),
      );

      targetFrameRef.current =
        targetFrame;

      if (
        animationFrameRef.current ===
        null
      ) {
        animationFrameRef.current =
          window.requestAnimationFrame(
            animateFrame,
          );
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(
        updateScrollProgress,
      );
    };

    const handleResize = () => {
      drawFrame(
        Math.round(
          currentFrameRef.current,
        ),
      );

      updateScrollProgress();
    };

    updateScrollProgress();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, [
    animateFrame,
    drawFrame,
    isReady,
  ]);

  const introProgress =
    getRangeProgress(
      scrollProgress,
      0,
      0.22,
    );

  const coffeeProgress =
    getRangeProgress(
      scrollProgress,
      0.2,
      0.48,
    );

  const mealProgress =
    getRangeProgress(
      scrollProgress,
      0.46,
      0.75,
    );

  const finalProgress =
    getRangeProgress(
      scrollProgress,
      0.72,
      1,
    );

  const introOpacity =
    scrollProgress < 0.19
      ? 1
      : 1 -
        getRangeProgress(
          scrollProgress,
          0.19,
          0.3,
        );

  const coffeeOpacity =
    scrollProgress < 0.2
      ? 0
      : scrollProgress < 0.44
        ? easeInOut(
            coffeeProgress,
          )
        : 1 -
          getRangeProgress(
            scrollProgress,
            0.44,
            0.55,
          );

  const mealOpacity =
    scrollProgress < 0.46
      ? 0
      : scrollProgress < 0.7
        ? easeInOut(mealProgress)
        : 1 -
          getRangeProgress(
            scrollProgress,
            0.7,
            0.8,
          );

  const finalOpacity =
    easeInOut(finalProgress);

  return (
    <section
      id="cafe-hero"
      ref={sectionRef}
      className="
        relative h-[420vh]
        bg-[#120a05]
        sm:h-[460vh]
        lg:h-[500vh]
      "
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#120a05]">
        {/* Image sequence canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />

        {/* Main dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(17,8,3,0.94)_0%,rgba(31,16,7,0.77)_35%,rgba(36,18,7,0.25)_68%,rgba(0,0,0,0.08)_100%)]" />

        {/* Bottom shading */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#130903]/85 via-transparent to-black/25" />

        {/* Honey lighting */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-[#d89a3d]/20 blur-[150px]" />

        <div className="pointer-events-none absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-[#f2b949]/10 blur-[160px]" />

        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Loading screen */}
        <div
          className={`
            absolute inset-0 z-50
            flex items-center
            justify-center
            bg-[#130a05]
            transition-all
            duration-700
            ${
              isReady
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }
          `}
        >
          <div className="flex flex-col items-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#e0a347]/25 bg-[#e0a347]/10">
              <Coffee className="h-8 w-8 animate-pulse text-[#f0b85c]" />

              <div className="absolute inset-[-8px] animate-spin rounded-full border border-transparent border-t-[#efb85d]" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#e6b260]">
              Brewing experience
            </p>

            <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a96c22] via-[#e2a548] to-[#f4cb76] transition-all duration-300"
                style={{
                  width: `${loadingProgress}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-white/50">
              {loadingProgress}%
            </p>
          </div>
        </div>

        {/* Intro content */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center"
          style={{
            opacity: introOpacity,
            transform: `translateY(${
              introProgress * -34
            }px)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-2xl">

              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-[82px]">
                TASTE THE
                <span className="block bg-gradient-to-r from-[#fff5dc] via-[#e8ad54] to-[#b77527] bg-clip-text text-transparent">
                  GOOD MOMENTS.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-stone-200/85 sm:text-lg sm:leading-8">
                Handcrafted coffee, fresh
                meals and sweet moments,
                served in one warm and
                welcoming space.
              </p>

              <div className="pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToMenu}
                  className="
                    group inline-flex
                    cursor-pointer
                    items-center
                    justify-center gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-[#b97828]
                    via-[#dc9d42]
                    to-[#efbd69]
                    px-7 py-3.5
                    text-sm font-extrabold
                    text-[#241207]
                    shadow-[0_18px_45px_rgba(202,135,48,0.28)]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_22px_55px_rgba(202,135,48,0.38)]
                  "
                >
                  Explore Our Menu

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    items-center
                    justify-center gap-2
                    rounded-full
                    border
                    border-white/20
                    bg-black/25
                    px-7 py-3.5
                    text-sm font-bold
                    text-white
                    backdrop-blur-md
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-white/10
                  "
                >
                  <MapPin className="h-4 w-4 text-[#f0b75b]" />

                  Visit Our Cafe
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-6 border-t border-white/15 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a247]/25 bg-[#d99637]/10">
                    <Coffee className="h-5 w-5 text-[#efb55d]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Premium coffee
                    </p>

                    <p className="text-xs text-white/55">
                      Freshly prepared
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a247]/25 bg-[#d99637]/10">
                    <Clock3 className="h-5 w-5 text-[#efb55d]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Open every day
                    </p>

                    <p className="text-xs text-white/55">
                      Relax and enjoy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coffee stage */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center"
          style={{
            opacity: coffeeOpacity,
            transform: `translateX(${
              (1 - coffeeProgress) *
              -50
            }px)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#efb55d]">
                Crafted with care
              </p>

              <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl">
                BREWED FOR
                <span className="block text-[#e6a746]">
                  EVERY MOMENT.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-stone-200/80">
                Rich espresso, silky milk
                and carefully selected beans
                come together in every cup.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-5 py-4 backdrop-blur-md">
                <Star className="h-5 w-5 fill-[#efb55d] text-[#efb55d]" />

                <div>
                  <p className="text-sm font-bold text-white">
                    Signature blends
                  </p>

                  <p className="text-xs text-white/55">
                    Smooth, balanced and
                    memorable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal stage */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end"
          style={{
            opacity: mealOpacity,
            transform: `translateY(${
              (1 - mealProgress) * 45
            }px)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg text-left lg:text-right">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#edb75d]/25 bg-black/25 px-4 py-2 backdrop-blur-md">
                <UtensilsCrossed className="h-4 w-4 text-[#f1bd63]" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4ce87]">
                  Freshly served
                </span>
              </div>

              <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl">
                MORE THAN
                <span className="block text-[#e3a142]">
                  JUST COFFEE.
                </span>
              </h2>

              <p className="mt-5 text-base leading-7 text-stone-200/80">
                Enjoy fresh breakfasts,
                artisan sandwiches, pastries,
                desserts and satisfying meals
                prepared for every appetite.
              </p>
            </div>
          </div>
        </div>

        {/* Final stage */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center"
          style={{
            opacity: finalOpacity,
            transform: `scale(${
              0.96 +
              finalProgress * 0.04
            })`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#efb55d]">
                Cafe Bee
              </p>

              <h2 className="mt-4 text-4xl font-black leading-[0.96] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                SIP. TASTE.
                <span className="block bg-gradient-to-r from-[#fff4d5] via-[#e7a84c] to-[#a96820] bg-clip-text text-transparent">
                  ENJOY.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-stone-200/85 sm:text-lg">
                Your next favourite coffee,
                meal and memory are waiting.
              </p>

              <div className="pointer-events-auto mt-8">
                <button
                  type="button"
                  onClick={scrollToMenu}
                  className="
                    group inline-flex
                    cursor-pointer
                    items-center gap-2
                    rounded-full
                    bg-white
                    px-7 py-3.5
                    text-sm font-extrabold
                    text-[#2a1509]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#fff0cf]
                  "
                >
                  View Full Menu

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform: translateY(260%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}