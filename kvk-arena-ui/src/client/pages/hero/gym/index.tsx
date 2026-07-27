import SignupModal from "@/components/signup/gym";
import {
  ArrowRight,
  Dumbbell,
  HeartPulse,
  LoaderCircle,
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

  return `/gym-sequence/ezgif-frame-${frameNumber}.png`;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const getRangeProgress = (
  progress: number,
  start: number,
  end: number,
) => clamp((progress - start) / (end - start));

const easeInOut = (value: number) =>
  value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;

export default function GymHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderedFrameRef = useRef(-1);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isOpenSignup, setIsOpenSignup] = useState(false);

  const frameSources = useMemo(
    () =>
      Array.from({ length: FRAME_COUNT }, (_, index) =>
        getFramePath(index + 1),
      ),
    [],
  );

    const memberId =
    localStorage.getItem("memberId") || null;
  const memberName =
    localStorage.getItem("memberName") || null;
  const memberEmail =
    localStorage.getItem("memberEmail") || null;
  const memberToken =
    localStorage.getItem("memberToken") || null;

  const isLoggedIn = Boolean(
    memberToken ||
      memberName ||
      memberEmail ||
      memberId,
  );

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frameIndex];

    if (!canvas || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) return;

    const containerWidth = canvas.clientWidth;
    const containerHeight = canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const targetWidth = Math.floor(containerWidth * pixelRatio);
    const targetHeight = Math.floor(containerHeight * pixelRatio);

    if (
      canvas.width !== targetWidth ||
      canvas.height !== targetHeight
    ) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    /*
     * Similar to object-fit: cover.
     * The image fills the hero without stretching.
     */
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;

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
  }, []);

  useEffect(() => {
    if (frameSources.length === 0) {
      console.error(
        "No gym frames were found. Check the frame folder and filename format.",
      );
      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    const images = frameSources.map((source, index) => {
      const image = new Image();

      image.decoding = "async";
      image.src = source;

      image.onload = () => {
        if (cancelled) return;

        loadedCount += 1;
        setLoadedFrames(loadedCount);

        if (index === 0) {
          drawFrame(0);
          setIsReady(true);
        }

        if (loadedCount === frameSources.length) {
          setIsReady(true);
        }
      };

      image.onerror = () => {
        console.error(`Unable to load gym frame: ${source}`);
      };

      return image;
    });

    imagesRef.current = images;

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [drawFrame, frameSources]);

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
        Math.floor(progress * (frameSources.length - 1)),
      );

      if (frameIndex !== lastRenderedFrameRef.current) {
        drawFrame(frameIndex);
      }
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = window.requestAnimationFrame(() => {
        updateScrollProgress();
        animationFrameRef.current = null;
      });
    };

    const handleResize = () => {
      lastRenderedFrameRef.current = -1;
      updateScrollProgress();
    };

    updateScrollProgress();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawFrame, frameSources.length]);

  /*
   * Different content blocks enter and leave at different scroll points.
   * This helps the pinned hero feel like the page is travelling downward.
   */

  const introExit = easeInOut(
    getRangeProgress(scrollProgress, 0.05, 0.28),
  );

  const strengthEnter = easeInOut(
    getRangeProgress(scrollProgress, 0.22, 0.38),
  );
  const strengthExit = easeInOut(
    getRangeProgress(scrollProgress, 0.46, 0.59),
  );

  const cardioEnter = easeInOut(
    getRangeProgress(scrollProgress, 0.52, 0.67),
  );
  const cardioExit = easeInOut(
    getRangeProgress(scrollProgress, 0.73, 0.84),
  );

  const finalEnter = easeInOut(
    getRangeProgress(scrollProgress, 0.79, 0.94),
  );

  const introOpacity = 1 - introExit;
  const strengthOpacity = strengthEnter * (1 - strengthExit);
  const cardioOpacity = cardioEnter * (1 - cardioExit);
  const finalOpacity = finalEnter;

  const loadingPercentage =
    frameSources.length > 0
      ? Math.round((loadedFrames / frameSources.length) * 100)
      : 0;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-[500vh] bg-[#05070b]"
      >
        <SignupModal
                open={isOpenSignup}
                onClose={() =>
                  setIsOpenSignup(false)
                }
              />
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Scroll-controlled image sequence */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `scale(${1 + scrollProgress * 0.06})`,
            }}
          >
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              aria-label="KVK Gym workout experience"
            />
          </div>

          {/* Dark cinematic overlays */}
          <div className="pointer-events-none absolute inset-0 bg-black/20" />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.92)_0%,rgba(2,5,10,0.65)_34%,rgba(2,5,10,0.12)_65%,rgba(2,5,10,0.34)_100%)]" />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_25%,transparent_68%,rgba(0,0,0,0.8)_100%)]" />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(41,107,225,0.2),transparent_38%)]" />

          {/* Blue decorative glow */}
          <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#296BE1]/15 blur-[140px]" />


          {/* Initial loading screen */}
          <div
            className={`absolute inset-0 z-50 grid place-items-center bg-[#05070b] transition-all duration-700 ${
              isReady
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10">
                <LoaderCircle className="h-8 w-8 animate-spin text-[#296BE1]" />

                <div className="absolute inset-2 rounded-full border border-[#296BE1]/20" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Preparing your workout
              </p>

              <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#296BE1] transition-[width] duration-200"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-white/40">
                {loadingPercentage}%
              </p>
            </div>
          </div>

          {/* First hero content */}
          <div
            className="absolute inset-0 z-20 flex items-center will-change-transform"
            style={{
              opacity: introOpacity,
              transform: `translate3d(0, ${-introExit * 180}px, 0)`,
              pointerEvents:
                scrollProgress < 0.2 ? "auto" : "none",
            }}
          >
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
              <div className="max-w-2xl">
                <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white sm:text-7xl lg:text-[92px]">
                  Build your
                  <span className="block text-[#4d87ed]">
                    strongest
                  </span>
                  version.
                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                  Strength, endurance and focused training come
                  together in one powerful fitness experience at
                  KVK Arena.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  {!isLoggedIn && (
                    <button
                    type="button"
                    className="group cursor-pointer inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#296BE1] px-7 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_rgba(41,107,225,0.35)] transition hover:-translate-y-0.5 hover:bg-[#3979e8]"
                    onClick={() => setIsOpenSignup(true)}
                  >
                    Join Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  )}                  

                  <a href="#memberships">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer h-14 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/10"
                  >
                    Explore Memberships
                  </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Strength content */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end will-change-transform"
            style={{
              opacity: strengthOpacity,
              transform: `translate3d(0, ${
                (1 - strengthEnter) * 170 -
                strengthExit * 150
              }px, 0)`,
            }}
          >
            <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
              <div className="max-w-lg text-right">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 backdrop-blur-lg">
                  <Dumbbell className="h-4 w-4 text-[#6b9cf2]" />
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
                    Strength training
                  </span>
                </div>

                <h2 className="text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
                  Power is
                  <span className="block text-[#4d87ed]">
                    earned.
                  </span>
                </h2>

                <p className="ml-auto mt-6 max-w-md text-base leading-7 text-white/60">
                  Every repetition builds discipline. Every set
                  takes you closer to a stronger body and a
                  stronger mindset.
                </p>
              </div>
            </div>
          </div>

          {/* Cardio content */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center will-change-transform"
            style={{
              opacity: cardioOpacity,
              transform: `translate3d(0, ${
                (1 - cardioEnter) * 170 -
                cardioExit * 150
              }px, 0)`,
            }}
          >
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
              <div className="max-w-lg">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 backdrop-blur-lg">
                  <HeartPulse className="h-4 w-4 text-[#6b9cf2]" />
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
                    Cardio endurance
                  </span>
                </div>

                <h2 className="text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
                  Keep your
                  <span className="block text-[#4d87ed]">
                    momentum.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-7 text-white/60">
                  Improve stamina, increase endurance and keep
                  moving with workouts that challenge every part
                  of you.
                </p>
              </div>
            </div>
          </div>

          {/* Final content */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-center will-change-transform"
            style={{
              opacity: finalOpacity,
              transform: `translate3d(0, ${
                (1 - finalEnter) * 180
              }px, 0) scale(${0.94 + finalEnter * 0.06})`,
            }}
          >
            <div className="mx-auto max-w-4xl px-5">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.42em] text-[#8eb5f8]">
                Your progress starts here
              </p>

              <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white sm:text-7xl lg:text-[90px]">
                Train hard.
                <span className="block text-[#4d87ed]">
                  Live stronger.
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                Join KVK Gym and turn every workout into another
                step towards your best performance.
              </p>

              {!isLoggedIn ? (
                <button
                type="button"
                onClick={() => setIsOpenSignup(true)}
                className="pointer-events-auto cursor-pointer group mt-9 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#296BE1] px-8 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_rgba(41,107,225,0.4)] transition hover:-translate-y-0.5 hover:bg-[#3979e8]"
              >
                Start training
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              ) : (
                <a href="#memberships">
                <button
                  type="button"
                  className="pointer-events-auto cursor-pointer group mt-9 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#296BE1] px-8 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_rgba(41,107,225,0.4)] transition hover:-translate-y-0.5 hover:bg-[#3979e8]"
                >
                  Explore Memberships
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Normal section after the pinned animation */}
      {/* <section className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#296BE1]/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#296BE1]">
              KVK Gym experience
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              More than a
              <span className="block text-[#296BE1]">
                workout.
              </span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Dumbbell,
                number: "01",
                title: "Strength",
                description:
                  "Progressive workouts designed to build power and confidence.",
              },
              {
                icon: HeartPulse,
                number: "02",
                title: "Endurance",
                description:
                  "Cardio training that improves stamina and everyday performance.",
              },
              {
                icon: Zap,
                number: "03",
                title: "Performance",
                description:
                  "Focused routines that help you move, feel and perform better.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#296BE1]/30 hover:shadow-[0_22px_55px_rgba(41,107,225,0.12)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#296BE1]/10">
                      <Icon className="h-5 w-5 text-[#296BE1]" />
                    </div>

                    <span className="text-xs font-black text-slate-300">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-8 text-xl font-extrabold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section> */}
    </>
  );
}