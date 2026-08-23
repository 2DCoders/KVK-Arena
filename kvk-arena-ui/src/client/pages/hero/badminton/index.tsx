import {
  ArrowRight,
  Check,
  Crosshair,
  LoaderCircle,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FRAME_COUNT = 151;

const getFramePath = (frame: number) => {
  const frameNumber = String(frame).padStart(3, "0");

  return `/badminton-sequence/ezgif-frame-${frameNumber}.png`;
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

export default function BadmintonHero() {
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

  const scrollToCourts = () => {
    document
      .getElementById("courts")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /*
   * Draw the current image on the canvas with
   * behaviour similar to object-fit: cover.
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

      if (
        containerWidth === 0 ||
        containerHeight === 0
      ) {
        return;
      }

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
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        offsetY = (canvas.height - drawHeight) / 2;
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

      lastRenderedFrameRef.current = frameIndex;
    },
    [],
  );

  /*
   * Preload all badminton sequence frames.
   */
  useEffect(() => {
    if (frameSources.length === 0) {
      console.error(
        "No badminton frames found. Check the folder and filename format.",
      );

      return;
    }

    let cancelled = false;
    let completedCount = 0;

    const images = frameSources.map(
      (source, index) => {
        const image = new Image();

        image.decoding = "async";
        image.src = source;

        image.onload = () => {
          if (cancelled) return;

          completedCount += 1;
          setLoadedFrames(completedCount);

          if (index === 0) {
            drawFrame(0);
            setIsReady(true);
          }

          if (
            completedCount === frameSources.length
          ) {
            setIsReady(true);
          }
        };

        image.onerror = () => {
          if (cancelled) return;

          completedCount += 1;
          setLoadedFrames(completedCount);

          console.error(
            `Unable to load badminton frame: ${source}`,
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
   * Convert section scrolling into frame progress.
   */
  useEffect(() => {
    const updateScrollProgress = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();

      const scrollableDistance =
        section.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const travelledDistance = -rect.top;

      const progress = clamp(
        travelledDistance / scrollableDistance,
      );

      setScrollProgress(progress);

      const frameIndex = Math.min(
        frameSources.length - 1,
        Math.floor(
          progress * (frameSources.length - 1),
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
   * Scroll content animation ranges.
   */
  const introExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.08,
      0.25,
    ),
  );

  const speedEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.18,
      0.34,
    ),
  );

  const speedExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.39,
      0.52,
    ),
  );

  const precisionEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.46,
      0.62,
    ),
  );

  const precisionExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.67,
      0.79,
    ),
  );

  const finalEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.75,
      0.93,
    ),
  );

  const introOpacity = 1 - introExit;

  const speedOpacity =
    speedEnter * (1 - speedExit);

  const precisionOpacity =
    precisionEnter * (1 - precisionExit);

  const finalOpacity = finalEnter;

  const loadingPercentage =
    frameSources.length > 0
      ? Math.round(
          (loadedFrames /
            frameSources.length) *
            100,
        )
      : 0;

  return (
    <section
      ref={sectionRef}
      className="relative h-[420vh] bg-[#0d0805] sm:h-[460vh] lg:h-[500vh]"
    >
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden bg-[#0d0805]">
        {/* Scroll-controlled frame sequence */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `scale(${
              1 + scrollProgress * 0.035
            })`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-label="KVK Arena badminton experience"
          />
        </div>

        {/* Basic background darkness */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Dynamic cinematic overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              rgba(12, 7, 3, ${
                0.93 -
                scrollProgress * 0.1
              }) 0%,
              rgba(20, 10, 4, ${
                0.72 -
                scrollProgress * 0.12
              }) 36%,
              rgba(45, 21, 7, ${
                0.24 -
                scrollProgress * 0.06
              }) 68%,
              rgba(22, 10, 4, 0.08) 100%
            )`,
          }}
        />

        {/* Vertical contrast */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,4,2,0.42)_0%,transparent_28%,rgba(8,4,2,0.12)_58%,#0d0805_100%)] lg:bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,transparent_30%,transparent_66%,rgba(13,8,5,0.82)_100%)]" />

        {/* Warm atmosphere */}
        <div className="pointer-events-none absolute -left-48 top-[18%] h-[520px] w-[560px] rounded-full bg-[#D98B4D]/10 blur-[140px]" />

        <div className="pointer-events-none absolute -right-36 top-[28%] h-[450px] w-[450px] rounded-full bg-[#A65A2A]/10 blur-[130px]" />

        <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[400px] w-[80%] -translate-x-1/2 rounded-full bg-[#D98B4D]/10 blur-[120px]" />

        {/* Decorative lines */}
        <div className="pointer-events-none absolute left-[5%] top-[18%] hidden h-[56%] w-px bg-gradient-to-b from-transparent via-[#D98B4D]/30 to-transparent shadow-[0_0_16px_rgba(217,139,77,0.45)] sm:block" />

        <div className="pointer-events-none absolute -left-[8%] top-[34%] h-px w-[46%] -rotate-[9deg] bg-gradient-to-r from-transparent via-[#E7A66E]/25 to-transparent" />

        {/* Loading screen */}
        <div
          className={`absolute inset-0 z-50 grid place-items-center bg-[#0d0805] transition-all duration-700 ${
            isReady
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center px-5 text-center">
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#D98B4D]" />

              <div className="absolute inset-2 rounded-full border border-[#D98B4D]/15" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Preparing the court
            </p>

            <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8D481F] via-[#D98B4D] to-[#F0B37C] transition-[width] duration-200"
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

        {/* ================= INTRO CONTENT ================= */}
        <div
          className="absolute inset-0 z-20 flex items-center will-change-transform"
          style={{
            opacity: introOpacity,
            transform: `translate3d(0, ${
              -introExit * 150
            }px, 0)`,
            pointerEvents:
              scrollProgress < 0.2
                ? "auto"
                : "none",
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pb-20 lg:px-12 lg:pb-12">
            <div className="max-w-[670px]">

              <h1 className="max-w-[660px] text-[3.2rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-8xl">
                Train.

                <span className="relative mt-2 block w-fit">
                  <span className="bg-gradient-to-r from-[#F1B17B] via-[#D98B4D] to-[#A65A2A] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(217,139,77,0.3)]">
                    Play.
                  </span>

                  <span className="absolute -bottom-2 left-1 h-[2px] w-24 bg-gradient-to-r from-[#F1B17B] via-[#D98B4D] to-transparent shadow-[0_0_12px_rgba(217,139,77,0.7)] sm:w-32" />
                </span>

                <span className="mt-3 block">
                  Compete.
                </span>
              </h1>

              <p className="mt-8 max-w-[580px] text-sm leading-6 text-white/70 sm:text-lg sm:leading-8">
                Book your court, gather your team and
                experience fast-paced badminton on
                premium courts designed for recreational
                and competitive play.
              </p>

              <div className="mt-6 hidden max-w-[640px] grid-cols-3 gap-4 sm:grid">
                {[
                  "Premium courts",
                  "Easy booking",
                  "Instant confirmation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-white/70"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D98B4D]/35 bg-[#D98B4D]/15 text-[#F1B17B]">
                      <Check
                        size={11}
                        strokeWidth={3}
                      />
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row sm:mt-10">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="group inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-[#F1B17B]/20 bg-gradient-to-r from-[#9B4E22] to-[#D98B4D] px-6 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(217,139,77,0.28)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Book a Court

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={scrollToCourts}
                  className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#D98B4D]/25 bg-[#D98B4D]/[0.07] px-6 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:border-[#D98B4D]/45 hover:bg-[#D98B4D]/[0.12] hover:text-white"
                >
                  Explore Courts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SPEED CONTENT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end will-change-transform"
          style={{
            opacity: speedOpacity,
            transform: `translate3d(0, ${
              (1 - speedEnter) * 155 -
              speedExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-xl">
                <Zap className="h-4 w-4 text-[#F1B17B]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65 sm:text-xs">
                  Explosive speed
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Move faster.

                <span className="block bg-gradient-to-r from-[#F1B17B] via-[#D98B4D] to-[#A65A2A] bg-clip-text text-transparent">
                  React sharper.
                </span>
              </h2>

              <p className="ml-auto mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Push your movement, footwork and
                reaction speed through every rally,
                recovery and attacking opportunity.
              </p>
            </div>
          </div>
        </div>

        {/* ================= PRECISION CONTENT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center will-change-transform"
          style={{
            opacity: precisionOpacity,
            transform: `translate3d(0, ${
              (1 - precisionEnter) * 155 -
              precisionExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-xl">
                <Crosshair className="h-4 w-4 text-[#F1B17B]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65 sm:text-xs">
                  Absolute precision
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Control every

                <span className="block bg-gradient-to-r from-[#F1B17B] via-[#D98B4D] to-[#A65A2A] bg-clip-text text-transparent">
                  winning shot.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Improve your serves, drops, net play
                and powerful smashes on courts built
                for focus and consistent performance.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FINAL CONTENT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-center will-change-transform"
          style={{
            opacity: finalOpacity,
            transform: `translate3d(0, ${
              (1 - finalEnter) * 165
            }px, 0) scale(${
              0.94 + finalEnter * 0.06
            })`,
          }}
        >
          <div className="mx-auto max-w-4xl px-5">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.38em] text-[#F1B17B] sm:text-xs">
              Power · Precision · Passion
            </p>

            <h2 className="text-[2.9rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-[88px]">
              Own every

              <span className="block bg-gradient-to-r from-[#F1B17B] via-[#D98B4D] to-[#A65A2A] bg-clip-text text-transparent">
                moment.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-lg sm:leading-8">
              Step onto the court, challenge your
              limits and experience every rally,
              smash and winning point at KVK Arena.
            </p>

            <div className="pointer-events-auto mt-9 flex flex-col justify-center gap-3 min-[390px]:flex-row">
              <button
                type="button"
                onClick={scrollToBooking}
                className="group inline-flex h-13 cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#9B4E22] to-[#D98B4D] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_50px_rgba(217,139,77,0.32)] transition hover:-translate-y-0.5"
              >
                Book Your Court

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToCourts}
                className="inline-flex h-13 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                View Courts
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}