import {
  ArrowRight,
  Check,
  Gamepad2,
  LoaderCircle,
  Shield,
  Swords,
  Trophy,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Change this to match the exact number of
 * extracted frames in your gaming video.
 */
const FRAME_COUNT = 300;

const getFramePath = (frame: number) => {
  const frameNumber = String(frame).padStart(3, "0");

  return `/gaming-sequence/ezgif-frame-${frameNumber}.png`;
};

const clamp = (
  value: number,
  min = 0,
  max = 1,
) => Math.min(Math.max(value, min), max);

const getRangeProgress = (
  progress: number,
  start: number,
  end: number,
) => clamp((progress - start) / (end - start));

const easeInOut = (value: number) =>
  value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;

export default function GamingHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderedFrameRef = useRef(-1);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const frameSources = useMemo(
    () =>
      Array.from(
        { length: FRAME_COUNT },
        (_, index) => getFramePath(index + 1),
      ),
    [],
  );

  const scrollToBooking = () => {
    document
      .getElementById("bookings")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToGames = () => {
    document
      .getElementById("games")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /*
   * Draw a frame using object-cover behaviour.
   *
   * The objectPositionX value keeps more of the
   * character visible on the right side.
   */
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const image = imagesRef.current[frameIndex];

      if (
        !canvas ||
        !image ||
        !image.complete ||
        image.naturalWidth === 0
      ) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) return;

      const containerWidth = canvas.clientWidth;
      const containerHeight = canvas.clientHeight;

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      const targetWidth = Math.floor(
        containerWidth * pixelRatio,
      );

      const targetHeight = Math.floor(
        containerHeight * pixelRatio,
      );

      if (
        canvas.width !== targetWidth ||
        canvas.height !== targetHeight
      ) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const imageRatio =
        image.naturalWidth / image.naturalHeight;

      const canvasRatio =
        canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;

        /*
         * Default centered position.
         */
        offsetX =
          (canvas.width - drawWidth) / 2;

        /*
         * On mobile, move the image slightly left
         * so the right-side character remains visible.
         */
        if (window.innerWidth < 768) {
          offsetX =
            canvas.width - drawWidth;
        }
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;

        offsetY =
          (canvas.height - drawHeight) / 2;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );

      lastRenderedFrameRef.current =
        frameIndex;
    },
    [],
  );

  /*
   * Preload all gaming sequence frames.
   */
  useEffect(() => {
    if (frameSources.length === 0) {
      console.error(
        "No gaming frames found. Check the frame folder and filenames.",
      );

      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    const images = frameSources.map(
      (source, index) => {
        const image = new Image();

        image.decoding = "async";
        image.src = source;

        image.onload = () => {
          if (cancelled) return;

          loadedCount += 1;
          setLoadedFrames(loadedCount);

          /*
           * Display the first frame immediately.
           */
          if (index === 0) {
            drawFrame(0);
            setIsReady(true);
          }

          if (
            loadedCount === frameSources.length
          ) {
            setIsReady(true);
          }
        };

        image.onerror = () => {
          console.error(
            `Unable to load gaming frame: ${source}`,
          );
        };

        return image;
      },
    );

    imagesRef.current = images;

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [drawFrame, frameSources]);

  /*
   * Convert the section scroll position into
   * image-sequence progress.
   */
  useEffect(() => {
    const updateScrollProgress = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect =
        section.getBoundingClientRect();

      const scrollableDistance =
        section.offsetHeight -
        window.innerHeight;

      if (scrollableDistance <= 0) return;

      const travelledDistance = -rect.top;

      const progress = clamp(
        travelledDistance /
          scrollableDistance,
      );

      setScrollProgress(progress);

      const frameIndex = Math.min(
        frameSources.length - 1,
        Math.floor(
          progress *
            (frameSources.length - 1),
        ),
      );

      if (
        frameIndex !==
        lastRenderedFrameRef.current
      ) {
        drawFrame(frameIndex);
      }
    };

    const handleScroll = () => {
      if (
        animationFrameRef.current !== null
      ) {
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(() => {
          updateScrollProgress();
          animationFrameRef.current = null;
        });
    };

    const handleResize = () => {
      lastRenderedFrameRef.current = -1;
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
        animationFrameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, [drawFrame, frameSources.length]);

  /*
   * Scene one:
   * Initial hero content exits.
   */
  const introExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.08,
      0.24,
    ),
  );

  /*
   * Scene two:
   * Enemies arrive and battle begins.
   */
  const battleEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.17,
      0.33,
    ),
  );

  const battleExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.39,
      0.52,
    ),
  );

  /*
   * Scene three:
   * Main combat action.
   */
  const combatEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.46,
      0.62,
    ),
  );

  const combatExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.68,
      0.8,
    ),
  );

  /*
   * Scene four:
   * Final victorious state.
   */
  const finalEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.76,
      0.94,
    ),
  );

  const introOpacity = 1 - introExit;

  const battleOpacity =
    battleEnter * (1 - battleExit);

  const combatOpacity =
    combatEnter * (1 - combatExit);

  const finalOpacity = finalEnter;

  const loadingPercentage =
    frameSources.length > 0
      ? Math.round(
          (loadedFrames /
            frameSources.length) *
            100,
        )
      : 0;

  const currentStep =
    scrollProgress < 0.25
      ? 0
      : scrollProgress < 0.5
        ? 1
        : scrollProgress < 0.75
          ? 2
          : 3;

  return (
    <section
      ref={sectionRef}
      className="relative h-[420vh] bg-black sm:h-[460vh] lg:h-[500vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        {/* Image sequence */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `scale(${
              1 + scrollProgress * 0.04
            })`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-label="KVK Arena gaming cinematic experience"
          />
        </div>

        {/* General darkness */}
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        {/* Left cinematic overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              rgba(0, 0, 0, ${
                0.97 -
                scrollProgress * 0.08
              }) 0%,
              rgba(2, 0, 2, ${
                0.83 -
                scrollProgress * 0.12
              }) 32%,
              rgba(20, 0, 0, ${
                0.4 -
                scrollProgress * 0.08
              }) 60%,
              rgba(0, 0, 0, 0.05) 100%
            )`,
          }}
        />

        {/* Vertical overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_28%,transparent_62%,rgba(0,0,0,0.92)_100%)]" />

        {/* Red atmosphere */}
        <div className="pointer-events-none absolute -left-52 top-[18%] h-[540px] w-[600px] rounded-full bg-red-700/5 blur-[150px]" />

        <div className="pointer-events-none absolute -right-36 top-[16%] h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[140px]" />

        <div className="pointer-events-none absolute bottom-[-200px] left-1/2 h-[420px] w-[85%] -translate-x-1/2 rounded-full bg-red-800/5 blur-[130px]" />

        {/* Decorative red lines */}
        <div className="pointer-events-none absolute left-[5%] top-[18%] hidden h-[58%] w-px bg-gradient-to-b from-transparent via-red-500/15 to-transparent shadow-[0_0_18px_rgba(239,68,68,0.5)] sm:block" />

        <div className="pointer-events-none absolute -left-[8%] top-[36%] h-px w-[46%] -rotate-[9deg] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />

        {/* Loading screen */}
        <div
          className={`absolute inset-0 z-50 grid place-items-center bg-black transition-all duration-700 ${
            isReady
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center px-5 text-center">
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-red-500/20 bg-red-500/5">
              <LoaderCircle className="h-8 w-8 animate-spin text-red-500" />

              <div className="absolute inset-2 rounded-full border border-red-400/10" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
              Loading the arena
            </p>

            <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 transition-[width] duration-200"
                style={{
                  width: `${loadingPercentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-white/40">
              {loadingPercentage}%
            </p>
          </div>
        </div>

        {/* ================= INTRO ================= */}
        <div
          className="absolute inset-0 z-20 flex items-center will-change-transform"
          style={{
            opacity: introOpacity,
            transform: `translate3d(0, ${
              -introExit * 160
            }px, 0)`,
            pointerEvents:
              scrollProgress < 0.2
                ? "auto"
                : "none",
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pb-20 lg:px-12">
            <div className="max-w-[680px]">

              <h1 className="max-w-[670px] text-[3rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-[82px]">
                Enter the

                <span className="relative mt-2 block w-fit">
                  <span className="bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(239,68,68,0.35)]">
                    Arena.
                  </span>

                  <span className="absolute -bottom-2 left-1 h-[2px] w-28 bg-gradient-to-r from-red-300 via-red-600 to-transparent shadow-[0_0_14px_rgba(239,68,68,0.85)] sm:w-40" />
                </span>

                <span className="mt-4 block">
                  Prove your skills.
                </span>
              </h1>

              <p className="mt-8 max-w-[580px] text-sm leading-6 text-gray-300 sm:text-lg sm:leading-8">
                Enter a premium gaming experience
                featuring powerful PCs, PlayStation 5,
                pool tables and private movie rooms.
              </p>

              <div className="mt-6 hidden max-w-[630px] grid-cols-3 gap-4 sm:grid">
                {[
                  "High-end gaming",
                  "Competitive matches",
                  "Private experiences",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-gray-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/15 text-red-200">
                      <Check
                        size={11}
                        strokeWidth={3}
                      />
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 min-[390px]:flex-row">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="group inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-red-300/20 bg-gradient-to-r from-red-800 via-red-600 to-red-500 px-7 text-sm font-semibold text-white shadow-[0_15px_45px_rgba(220,38,38,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(220,38,38,0.42)]"
                >
                  Book a Slot

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={scrollToGames}
                  className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-gray-200 backdrop-blur-md transition-all duration-300 hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
                >
                  Explore Games
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BATTLE ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end will-change-transform"
          style={{
            opacity: battleOpacity,
            transform: `translate3d(0, ${
              (1 - battleEnter) * 160 -
              battleExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-black/40 px-4 py-2 backdrop-blur-xl">
                <Shield className="h-4 w-4 text-red-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/65 sm:text-xs">
                  Face the challenge
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Enemies rise.

                <span className="block bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent">
                  Never retreat.
                </span>
              </h2>

              <p className="ml-auto mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Every match is a new battle. React
                quickly, execute your strategy and
                overcome every opponent standing
                between you and victory.
              </p>
            </div>
          </div>
        </div>

        {/* ================= COMBAT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center will-change-transform"
          style={{
            opacity: combatOpacity,
            transform: `translate3d(0, ${
              (1 - combatEnter) * 160 -
              combatExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-black/40 px-4 py-2 backdrop-blur-xl">
                <Swords className="h-4 w-4 text-red-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/65 sm:text-xs">
                  Master the battle
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Strike faster.

                <span className="block bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent">
                  Fight smarter.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Precision, timing and teamwork decide
                the outcome. Control the battlefield
                and turn every challenge into your
                next victory.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FINAL ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-center will-change-transform"
          style={{
            opacity: finalOpacity,
            transform: `translate3d(0, ${
              (1 - finalEnter) * 170
            }px, 0) scale(${
              0.94 + finalEnter * 0.06
            })`,
          }}
        >
          <div className="mx-auto max-w-5xl px-5">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-black/35 px-4 py-2 backdrop-blur-xl">
              <Trophy className="h-4 w-4 text-red-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/65 sm:text-xs">
                Victory awaits
              </span>
            </div>

            <h2 className="text-[2.9rem] font-black uppercase leading-[0.86] tracking-[-0.06em] text-white sm:text-7xl lg:text-[92px]">
              Become the

              <span className="block bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                champion.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-6 text-white/65 sm:text-lg sm:leading-8">
              Gather your squad, reserve your gaming
              station and experience the ultimate
              challenge at KVK Arena.
            </p>

            <div className="pointer-events-auto mt-9 flex flex-col justify-center gap-3 min-[390px]:flex-row">
              <button
                type="button"
                onClick={scrollToBooking}
                className="group inline-flex h-13 cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 px-8 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_55px_rgba(220,38,38,0.38)] transition hover:-translate-y-0.5"
              >
                Book Your Battle

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToGames}
                className="inline-flex h-13 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition hover:border-red-400/35 hover:bg-red-500/10"
              >
                Explore Games
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}