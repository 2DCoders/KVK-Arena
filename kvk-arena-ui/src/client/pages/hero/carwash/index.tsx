import {
  ArrowRight,
  Check,
  Droplets,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FRAME_COUNT = 260;

const getFramePath = (frame: number) => {
  const frameNumber = String(frame).padStart(3, "0");

  return `/carwash-sequence/ezgif-frame-${frameNumber}.png`;
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

export default function CarwashHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(
    null,
  );

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number | null>(
    null,
  );

  const lastRenderedFrameRef = useRef(-1);

  const [scrollProgress, setScrollProgress] =
    useState(0);

  const [loadedFrames, setLoadedFrames] =
    useState(0);

  const [isReady, setIsReady] = useState(false);

  const frameSources = useMemo(
    () =>
      Array.from(
        { length: FRAME_COUNT },
        (_, index) => getFramePath(index + 1),
      ),
    [],
  );

  const scrollToPackages = () => {
    document
      .getElementById("packages")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToPricing = () => {
    document
      .getElementById("pricing")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /*
   * Draw a frame onto the canvas using
   * object-fit: cover behaviour.
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

        offsetX =
          (canvas.width - drawWidth) / 2;
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
   * Preload all image sequence frames.
   */
  useEffect(() => {
    if (frameSources.length === 0) {
      console.error(
        "No car wash frames found. Check the folder and filename format.",
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
           * Display the first frame as soon
           * as it becomes available.
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
            `Unable to load car wash frame: ${source}`,
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
   * Content animation ranges.
   */
  const introExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.08,
      0.25,
    ),
  );

  const washEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.18,
      0.34,
    ),
  );

  const washExit = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.39,
      0.52,
    ),
  );

  const detailEnter = easeInOut(
    getRangeProgress(
      scrollProgress,
      0.46,
      0.62,
    ),
  );

  const detailExit = easeInOut(
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

  const washOpacity =
    washEnter * (1 - washExit);

  const detailOpacity =
    detailEnter * (1 - detailExit);

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
      className="relative h-[420vh] bg-[#02040a] sm:h-[460vh] lg:h-[500vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#02040a]">
        {/* Image sequence */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `scale(${
              1 + scrollProgress * 0.045
            })`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-label="KVK Arena premium car wash experience"
          />
        </div>

        {/* Basic darkness */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Horizontal cinematic overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              rgba(1, 3, 10, ${
                0.94 -
                scrollProgress * 0.12
              }) 0%,
              rgba(1, 4, 12, ${
                0.76 -
                scrollProgress * 0.15
              }) 38%,
              rgba(0, 12, 35, ${
                0.26 -
                scrollProgress * 0.08
              }) 72%,
              rgba(0, 8, 25, 0.08) 100%
            )`,
          }}
        />

        {/* Mobile vertical overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,10,0.46)_0%,transparent_30%,rgba(2,4,10,0.18)_58%,#02040a_100%)] lg:bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_28%,transparent_68%,rgba(2,4,10,0.78)_100%)]" />

        {/* Blue atmosphere */}
        <div className="pointer-events-none absolute -left-48 top-[18%] h-[520px] w-[560px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="pointer-events-none absolute -right-36 top-[30%] h-[440px] w-[440px] rounded-full bg-[#1473ff]/10 blur-[130px]" />

        <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[400px] w-[80%] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Decorative lines */}
        <div className="pointer-events-none absolute left-[5%] top-[18%] hidden h-[56%] w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent shadow-[0_0_16px_rgba(59,130,246,0.4)] sm:block" />

        <div className="pointer-events-none absolute -left-[8%] top-[34%] h-px w-[46%] -rotate-[9deg] bg-gradient-to-r from-transparent via-blue-300/25 to-transparent" />

        {/* Loading screen */}
        <div
          className={`absolute inset-0 z-50 grid place-items-center bg-[#02040a] transition-all duration-700 ${
            isReady
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center px-5 text-center">
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#1473ff]" />

              <div className="absolute inset-2 rounded-full border border-blue-400/15" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Preparing your experience
            </p>

            <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0757d4] to-[#1688ff] transition-[width] duration-200"
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
              -introExit * 160
            }px, 0)`,
            pointerEvents:
              scrollProgress < 0.2
                ? "auto"
                : "none",
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pb-20 lg:px-12 lg:pb-12">
            <div className="max-w-[660px]">

              <h1 className="max-w-[650px] text-[3rem] font-bold leading-[0.92] tracking-[-0.055em] text-white sm:text-7xl lg:text-8xl">
                ELEVATE EVERY

                <span className="relative mt-2 block w-fit">
                  <span className="bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.35)]">
                    DRIVE
                  </span>

                  <span className="absolute -bottom-2 left-1 h-[2px] w-24 bg-gradient-to-r from-cyan-300 via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] sm:w-32" />
                </span>
              </h1>

              <p className="mt-8 max-w-[570px] text-sm leading-6 text-gray-300 sm:text-lg sm:leading-8">
                Precision washing, professional
                detailing and lasting protection
                designed to keep your vehicle
                looking its absolute best.
              </p>

              <div className="mt-6 hidden max-w-[600px] grid-cols-3 gap-4 sm:grid">
                {[
                  "Professional detailing",
                  "Premium products",
                  "Careful finishing",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-gray-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/15 text-blue-200">
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
                  onClick={scrollToPackages}
                  className="group inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-blue-300/20 bg-gradient-to-r from-[#0757d4] to-[#1688ff] px-6 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(0,102,255,0.32)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Packages

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-blue-300/20 bg-blue-500/[0.07] px-6 text-sm font-semibold text-gray-200 backdrop-blur-md transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/[0.12] hover:text-white"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= WASH CONTENT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end will-change-transform"
          style={{
            opacity: washOpacity,
            transform: `translate3d(0, ${
              (1 - washEnter) * 160 -
              washExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-xl">
                <Droplets className="h-4 w-4 text-[#70b7ff]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65 sm:text-xs">
                  Precision wash
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Every surface

                <span className="block bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent">
                  perfected.
                </span>
              </h2>

              <p className="ml-auto mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                High-quality products and careful
                washing techniques remove dirt
                while protecting your vehicle’s
                finish.
              </p>
            </div>
          </div>
        </div>

        {/* ================= DETAIL CONTENT ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center will-change-transform"
          style={{
            opacity: detailOpacity,
            transform: `translate3d(0, ${
              (1 - detailEnter) * 160 -
              detailExit * 145
            }px, 0)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4 text-[#70b7ff]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65 sm:text-xs">
                  Premium protection
                </span>
              </div>

              <h2 className="text-[2.8rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Lasting care.

                <span className="block bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent">
                  flawless shine.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Detailed finishing and premium
                protective treatments keep your
                vehicle cleaner, brighter and
                protected for longer.
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
              (1 - finalEnter) * 170
            }px, 0) scale(${
              0.94 + finalEnter * 0.06
            })`,
          }}
        >
          <div className="mx-auto max-w-4xl px-5">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.38em] text-[#8eb5f8] sm:text-xs">
              Your vehicle deserves more
            </p>

            <h2 className="text-[2.9rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-[88px]">
              Clean deeper.

              <span className="block bg-gradient-to-r from-[#70b7ff] via-[#1473ff] to-[#8fdcff] bg-clip-text text-transparent">
                Shine brighter.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-lg sm:leading-8">
              Give your vehicle the professional
              wash, detailing and protection it
              deserves at KVK Arena.
            </p>

            <div className="pointer-events-auto mt-9 flex flex-col justify-center gap-3 min-[390px]:flex-row">
              <button
                type="button"
                onClick={scrollToPackages}
                className="group inline-flex h-13 cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#0757d4] to-[#1688ff] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_50px_rgba(20,115,255,0.38)] transition hover:-translate-y-0.5"
              >
                Explore Packages

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToPricing}
                className="inline-flex h-13 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>

        {/* Bottom progress navigation */}
        {/* <div className="absolute bottom-5 left-1/2 z-30 w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 sm:bottom-7">
          <div className="rounded-2xl border border-blue-300/15 bg-[#020711]/65 px-4 py-4 shadow-[0_18px_60px_rgba(0,76,255,0.12)] backdrop-blur-xl sm:px-6">
            <div className="flex items-center">
              {[
                {
                  label: "Arrival",
                  icon: Gauge,
                },
                {
                  label: "Wash",
                  icon: Droplets,
                },
                {
                  label: "Protect",
                  icon: ShieldCheck,
                },
                {
                  label: "Shine",
                  icon: Sparkles,
                },
              ].map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.label}
                    className="flex flex-1 items-center"
                  >
                    <div className="flex min-w-0 flex-col items-center">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-full border transition-all duration-500 sm:h-10 sm:w-10 ${
                          index <= currentStep
                            ? "border-blue-300/40 bg-[#1473ff] text-white shadow-[0_0_20px_rgba(20,115,255,0.4)]"
                            : "border-white/10 bg-white/5 text-white/35"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      <span
                        className={`mt-2 truncate text-[8px] font-bold uppercase tracking-[0.12em] transition-colors sm:text-[10px] ${
                          index <= currentStep
                            ? "text-white"
                            : "text-white/30"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {index < 3 && (
                      <div className="mx-2 mb-5 h-px flex-1 overflow-hidden bg-white/10 sm:mx-4">
                        <div
                          className="h-full bg-gradient-to-r from-[#1473ff] to-[#70b7ff] transition-[width] duration-500"
                          style={{
                            width:
                              index <
                              currentStep
                                ? "100%"
                                : index ===
                                    currentStep
                                  ? `${clamp(
                                      scrollProgress *
                                        4 -
                                        currentStep,
                                    ) * 100}%`
                                  : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}