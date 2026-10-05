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

import MOBILE_IMG from "../../../../assets/carwash-mobile.png";

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

  /**
   * Draw desktop frame sequence onto the canvas.
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

  /**
   * Preload desktop image-sequence frames.
   * Frames are loaded only on screens 640px and wider.
   */
  useEffect(() => {
    const desktopQuery = window.matchMedia(
      "(min-width: 640px)",
    );

    if (!desktopQuery.matches) {
      setIsReady(true);
      return;
    }

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

          if (index === 0) {
            requestAnimationFrame(() => {
              drawFrame(0);
            });

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

  /**
   * Convert desktop section scrolling into
   * image-sequence frame progress.
   */
  useEffect(() => {
    const desktopQuery = window.matchMedia(
      "(min-width: 640px)",
    );

    const updateScrollProgress = () => {
      if (!desktopQuery.matches) {
        setScrollProgress(0);
        return;
      }

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
      if (!desktopQuery.matches) return;

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

      requestAnimationFrame(() => {
        updateScrollProgress();
      });
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

    desktopQuery.addEventListener(
      "change",
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

      desktopQuery.removeEventListener(
        "change",
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

  /**
   * Existing desktop animation ranges.
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

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#02040a] sm:h-[460vh] lg:h-[500vh]"
    >
      {/* =====================================================
          MOBILE HERO
          Visible only below 640px
      ====================================================== */}
      <div className="relative min-h-[100svh] overflow-hidden bg-[#02040a] sm:hidden">
        {/* Mobile background */}
        <div className="absolute inset-0">
          <img
            src={MOBILE_IMG}
            alt="KVK Arena premium car wash"
            className="h-full w-full scale-[1.02] object-cover object-center"
          />
        </div>

        {/* Header readability overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.25)_22%,transparent_40%)]" />

        {/* Left and right vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,10,0.35)_0%,transparent_30%,transparent_70%,rgba(2,4,10,0.35)_100%)]" />

        {/* Bottom content overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_28%,rgba(2,4,10,0.04)_42%,rgba(2,4,10,0.55)_61%,rgba(2,4,10,0.94)_78%,#02040a_100%)]" />

        {/* Blue atmosphere */}
        <div className="pointer-events-none absolute -left-28 top-[20%] h-72 w-72 rounded-full bg-blue-600/10 blur-[90px]" />

        <div className="pointer-events-none absolute -right-24 top-[40%] h-72 w-72 rounded-full bg-[#1473ff]/10 blur-[95px]" />

        {/* Decorative vertical lines */}
        <div className="pointer-events-none absolute left-5 top-[16%] h-[31%] w-px bg-gradient-to-b from-transparent via-blue-300/35 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.35)]" />

        <div className="pointer-events-none absolute right-5 top-[19%] h-[24%] w-px bg-gradient-to-b from-transparent via-blue-300/20 to-transparent" />

        {/* Decorative horizontal light */}
        <div className="pointer-events-none absolute left-1/2 top-[54%] h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-300/15 to-transparent" />

        {/* Mobile content */}
        <div className="relative z-20 flex min-h-[100svh] items-end px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-32">
          <div className="w-full">
            {/* Heading */}
            <h1 className="max-w-[350px] text-[2.8rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white min-[390px]:text-[3.1rem]">
              Elevate
              <span className="block">
                Every
              </span>

              <span className="relative mt-1 block w-fit bg-gradient-to-r from-[#9de5ff] via-[#1473ff] to-[#70b7ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(20,115,255,0.42)]">
                Drive.

                <span className="absolute -bottom-2 left-1 h-[2px] w-20 bg-gradient-to-r from-[#8fdcff] via-[#1473ff] to-transparent shadow-[0_0_14px_rgba(20,115,255,0.85)]" />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[350px] text-[13px] leading-6 text-white/65">
              Precision washing, professional
              detailing and lasting protection for
              a cleaner, brighter and
              better-protected vehicle.
            </p>

            {/* Features */}
            {/* <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Premium products",
                "Professional care",
                "Flawless finish",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-md"
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-blue-300/20 bg-blue-500/20 text-blue-100">
                    <Check
                      size={9}
                      strokeWidth={3}
                    />
                  </span>

                  <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white/65 min-[390px]:text-[9px]">
                    {item}
                  </span>
                </div>
              ))}
            </div> */}

            {/* Buttons */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={scrollToPackages}
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-blue-300/20 bg-gradient-to-r from-[#0757d4] to-[#1688ff] px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_14px_35px_rgba(20,115,255,0.32)] transition active:scale-[0.98]"
              >
                Packages

                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={scrollToPricing}
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.065] px-4 text-[11px] font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition active:scale-[0.98]"
              >
                View Pricing
              </button>
            </div>

            {/* Bottom information */}
            {/* <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-white/35">
                  Professional care
                </p>

                <p className="mt-1 text-[10px] font-semibold text-white/65">
                  Wash • Detail • Protect
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Explore
                </span>

                <span className="relative block h-8 w-[18px] rounded-full border border-white/20 bg-white/[0.03]">
                  <span className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 animate-bounce rounded-full bg-[#70b7ff] shadow-[0_0_10px_rgba(112,183,255,0.9)]" />
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLET AND DESKTOP HERO
          Existing design begins from 640px
      ====================================================== */}
      <div className="sticky top-0 hidden h-[100svh] overflow-hidden bg-[#02040a] sm:block">
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

        {/* Desktop vertical overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_28%,transparent_68%,rgba(2,4,10,0.78)_100%)]" />

        {/* Blue atmosphere */}
        <div className="pointer-events-none absolute -left-48 top-[18%] h-[520px] w-[560px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="pointer-events-none absolute -right-36 top-[30%] h-[440px] w-[440px] rounded-full bg-[#1473ff]/10 blur-[130px]" />

        <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[400px] w-[80%] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Decorative lines */}
        <div className="pointer-events-none absolute left-[5%] top-[18%] h-[56%] w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent shadow-[0_0_16px_rgba(59,130,246,0.4)]" />

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
      </div>
    </section>
  );
}