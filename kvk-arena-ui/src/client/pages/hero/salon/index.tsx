import {
  ArrowRight,
  Clock3,
  MapPin,
  Scissors,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import MOBILE_BG from "@/assets/salon-mobile.png";

const FRAME_COUNT = 300;

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

  return `/salon-sequence/ezgif-frame-${frameNumber}.png`;
};

export default function SalonHero() {
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

  const scrollToBooking = () => {
    document
      .getElementById("booking")
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

    const difference =
      target - current;

    if (Math.abs(difference) < 0.05) {
      currentFrameRef.current =
        target;

      drawFrame(
        Math.round(
          currentFrameRef.current,
        ),
      );

      animationFrameRef.current =
        null;

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

    const updateScrollProgress =
      () => {
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

        const currentProgress =
          clamp(
            (window.scrollY -
              sectionTop) /
              scrollableDistance,
            0,
            1,
          );

        setScrollProgress(
          currentProgress,
        );

        const targetFrame =
          Math.min(
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

  const serviceProgress =
    getRangeProgress(
      scrollProgress,
      0.2,
      0.48,
    );

  const experienceProgress =
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

  const serviceOpacity =
    scrollProgress < 0.2
      ? 0
      : scrollProgress < 0.44
        ? easeInOut(
            serviceProgress,
          )
        : 1 -
          getRangeProgress(
            scrollProgress,
            0.44,
            0.55,
          );

  const experienceOpacity =
    scrollProgress < 0.46
      ? 0
      : scrollProgress < 0.7
        ? easeInOut(
            experienceProgress,
          )
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
      id="salon-hero"
      ref={sectionRef}
      className="
        relative
        bg-[#090511]
        sm:h-[460vh]
        lg:h-[500vh]
      "
    >
      {/* =====================================================
          MOBILE HERO
      ===================================================== */}

      <div className="relative min-h-[100svh] overflow-hidden bg-[#090511] sm:hidden">
        <img
          src={MOBILE_BG}
          alt="Premium unisex salon interior"
          className="
            absolute inset-0
            h-full w-full
            scale-[1.02]
            object-cover
            object-center
          "
        />

        {/* Soft overall darkening */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-[linear-gradient(
              180deg,
              rgba(7,3,13,0.48)_0%,
              rgba(10,4,18,0.10)_28%,
              rgba(12,5,22,0.18)_48%,
              rgba(7,3,13,0.72)_72%,
              rgba(5,2,10,0.98)_100%
            )]
          "
        />

        {/* Natural dark blend behind content */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-[radial-gradient(
              ellipse_at_12%_72%,
              rgba(7,3,13,0.88)_0%,
              rgba(15,5,27,0.58)_32%,
              rgba(20,7,34,0.20)_60%,
              transparent_86%
            )]
          "
        />

        {/* Purple atmosphere */}
        <div
          className="
            pointer-events-none
            absolute
            -left-32 top-[20%]
            h-[420px] w-[420px]
            rounded-full
            bg-[#7c3aed]/14
            blur-[130px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32 top-[38%]
            h-[360px] w-[360px]
            rounded-full
            bg-[#c084fc]/10
            blur-[130px]
          "
        />

        {/* Mobile content */}
        <div
          className="
            relative z-10
            flex min-h-[100svh]
            items-end
            px-5
            pb-[max(2rem,env(safe-area-inset-bottom))]
            pt-32
          "
        >
          <div className="w-full pb-2">
            <p
              className="
                mb-4
                flex items-center gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-[#c084fc]
                drop-shadow-[0_3px_15px_rgba(0,0,0,0.9)]
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              B Style Unisex Salon
            </p>

            <h1
              className="
                max-w-[360px]
                text-[2.85rem]
                font-black
                leading-[0.9]
                tracking-[-0.055em]
                text-white
                drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]
                min-[390px]:text-[3.15rem]
              "
            >
              DEFINE YOUR

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#f5eaff]
                  via-[#c084fc]
                  to-[#7c3aed]
                  bg-clip-text
                  text-transparent
                  drop-shadow-[0_8px_25px_rgba(124,58,237,0.3)]
                "
              >
                STYLE.
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-[340px]
                text-[13px]
                leading-6
                text-purple-100/80
                drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]
              "
            >
              Premium hair, beauty and grooming
              experiences for everyone. Step in,
              relax and leave feeling your best.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={scrollToBooking}
                className="
                  group inline-flex
                  h-12
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-gradient-to-r
                  from-[#7c3aed]
                  via-[#9333ea]
                  to-[#c084fc]
                  px-4
                  text-[11px]
                  font-extrabold
                  text-white
                  shadow-[0_14px_35px_rgba(124,58,237,0.38)]
                  transition
                  active:scale-[0.98]
                "
              >
                Book Now

                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>

              <a
                href={MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  h-12
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border border-purple-200/20
                  bg-black/30
                  px-3
                  text-[11px]
                  font-bold
                  text-white
                  backdrop-blur-md
                  transition
                  active:scale-[0.98]
                "
              >
                <MapPin
                  className="
                    h-4 w-4
                    text-[#c084fc]
                  "
                />

                Visit Us
              </a>
            </div>

            <div
              className="
                mt-6
                flex items-center gap-5
                border-t
                border-purple-200/15
                pt-4
              "
            >
              <div className="flex items-center gap-2">
                <Scissors
                  className="
                    h-4 w-4
                    text-[#c084fc]
                  "
                />

                <span className="text-[10px] font-semibold text-white/70">
                  Hair & Beauty
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock3
                  className="
                    h-4 w-4
                    text-[#c084fc]
                  "
                />

                <span className="text-[10px] font-semibold text-white/70">
                  Open Every Day
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP SCROLL EXPERIENCE
      ===================================================== */}

      <div className="sticky top-0 hidden h-screen overflow-hidden bg-[#090511] sm:block">
        <canvas
          ref={canvasRef}
          className="
            absolute inset-0
            h-full w-full
          "
        />

        {/* =====================================================
            CINEMATIC BLENDED DARK LAYERS
        ===================================================== */}

        {/* Main left-to-right blend */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-[linear-gradient(
              90deg,
              rgba(5,2,10,0.96)_0%,
              rgba(8,3,16,0.90)_14%,
              rgba(11,4,22,0.80)_27%,
              rgba(20,7,34,0.58)_40%,
              rgba(31,10,50,0.34)_55%,
              rgba(30,10,48,0.14)_72%,
              rgba(8,3,14,0.02)_100%
            )]
          "
        />

        {/* Large soft dark bloom behind text */}
        <div
          className="
            pointer-events-none
            absolute
            -left-[18%]
            top-1/2
            h-[85vh]
            w-[70vw]
            -translate-y-1/2
            rounded-full
            bg-[#08040f]/55
            blur-[140px]
          "
        />

        {/* Purple atmospheric blend */}
        <div
          className="
            pointer-events-none
            absolute
            -left-[10%]
            top-[12%]
            h-[75vh]
            w-[60vw]
            rounded-full
            bg-[#3b0764]/18
            blur-[160px]
          "
        />

        {/* Subtle central purple haze */}
        <div
          className="
            pointer-events-none
            absolute
            left-[25%]
            top-[15%]
            h-[55vh]
            w-[45vw]
            rounded-full
            bg-[#6d28d9]/8
            blur-[180px]
          "
        />

        {/* Bottom cinematic fade */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-[45%]
            bg-gradient-to-t
            from-[#07030d]/90
            via-[#090411]/35
            to-transparent
          "
        />

        {/* Top cinematic fade */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[24%]
            bg-gradient-to-b
            from-[#07030d]/48
            to-transparent
          "
        />

        {/* Right edge subtle vignette */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(
              ellipse_at_center,
              transparent_35%,
              rgba(5,2,10,0.12)_70%,
              rgba(5,2,10,0.48)_100%
            )]
          "
        />

        {/* Fine cinematic grain */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            opacity-[0.035]
          "
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E\")",
          }}
        />

        {/* =====================================================
            LOADING SCREEN
        ===================================================== */}

        <div
          className={`
            absolute inset-0 z-50
            flex items-center
            justify-center
            bg-[#090511]
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
            <div
              className="
                relative flex
                h-20 w-20
                items-center justify-center
                rounded-full
                border border-[#a855f7]/25
                bg-[#7c3aed]/10
              "
            >
              <Scissors
                className="
                  h-8 w-8
                  animate-pulse
                  text-[#c084fc]
                "
              />

              <div
                className="
                  absolute inset-[-8px]
                  animate-spin
                  rounded-full
                  border border-transparent
                  border-t-[#a855f7]
                "
              />
            </div>

            <p
              className="
                mt-6
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#c084fc]
              "
            >
              Preparing Your Experience
            </p>

            <div
              className="
                mt-4 h-1 w-48
                overflow-hidden
                rounded-full
                bg-white/10
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-[#6d28d9]
                  via-[#9333ea]
                  to-[#d8b4fe]
                  transition-all
                  duration-300
                "
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

        {/* =====================================================
            INTRO
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute inset-0 z-20
            flex items-center
          "
          style={{
            opacity: introOpacity,
            transform: `translateY(${
              introProgress * -34
            }px)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-2xl">
              <p
                className="
                  mb-4
                  flex items-center gap-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-[#c084fc]
                  drop-shadow-[0_3px_15px_rgba(0,0,0,0.9)]
                "
              >
                <Sparkles className="h-4 w-4" />

                B Style Unisex Salon
              </p>

              <h1
                className="
                  text-4xl
                  font-black
                  leading-[0.95]
                  tracking-[-0.055em]
                  text-white
                  drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]
                  sm:text-6xl
                  lg:text-[82px]
                "
              >
                DEFINE YOUR

                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-[#f5eaff]
                    via-[#c084fc]
                    to-[#7c3aed]
                    bg-clip-text
                    text-transparent
                    drop-shadow-[0_10px_30px_rgba(124,58,237,0.28)]
                  "
                >
                  STYLE.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-xl
                  text-base
                  leading-7
                  text-purple-100/80
                  drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)]
                  sm:text-lg
                  sm:leading-8
                "
              >
                Premium hair, beauty and grooming
                experiences for everyone, crafted
                with precision, creativity and care.
              </p>

              <div className="pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="
                    group
                    inline-flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-[#6d28d9]
                    via-[#9333ea]
                    to-[#c084fc]
                    px-7 py-3.5
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_18px_45px_rgba(124,58,237,0.32)]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_22px_55px_rgba(124,58,237,0.45)]
                  "
                >
                  Book Your Appointment

                  <ArrowRight
                    className="
                      h-4 w-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </button>
              </div>

              <div
                className="
                  mt-9
                  flex flex-wrap
                  gap-6
                  border-t
                  border-purple-200/15
                  pt-6
                  drop-shadow-[0_5px_18px_rgba(0,0,0,0.8)]
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      border border-purple-400/20
                      bg-purple-500/10
                      backdrop-blur-sm
                    "
                  >
                    <Scissors
                      className="
                        h-5 w-5
                        text-[#c084fc]
                      "
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Hair & Grooming
                    </p>

                    <p className="text-xs text-white/55">
                      Crafted for you
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      border border-purple-400/20
                      bg-purple-500/10
                      backdrop-blur-sm
                    "
                  >
                    <Users
                      className="
                        h-5 w-5
                        text-[#c084fc]
                      "
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Unisex Experience
                    </p>

                    <p className="text-xs text-white/55">
                      Everyone is welcome
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute inset-0 z-20
            flex items-center
          "
          style={{
            opacity: serviceOpacity,
            transform: `translateX(${
              (1 - serviceProgress) *
              -50
            }px)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.26em]
                  text-[#c084fc]
                  drop-shadow-[0_3px_15px_rgba(0,0,0,0.9)]
                "
              >
                Crafted With Precision
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                  font-black
                  leading-[0.98]
                  tracking-[-0.04em]
                  text-white
                  drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]
                  sm:text-6xl
                "
              >
                YOUR STYLE.

                <span
                  className="
                    block
                    text-[#a855f7]
                    drop-shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                  "
                >
                  YOUR MOMENT.
                </span>
              </h2>

              <p
                className="
                  mt-5
                  max-w-md
                  text-base
                  leading-7
                  text-purple-100/75
                  drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)]
                "
              >
                From precision cuts and styling to
                colour, grooming and beauty care,
                every service is designed around you.
              </p>

              <div
                className="
                  mt-7
                  inline-flex
                  items-center gap-3
                  rounded-2xl
                  border border-purple-300/15
                  bg-[#12091d]/45
                  px-5 py-4
                  shadow-[0_15px_40px_rgba(0,0,0,0.25)]
                  backdrop-blur-sm
                "
              >
                <Star
                  className="
                    h-5 w-5
                    fill-[#c084fc]
                    text-[#c084fc]
                  "
                />

                <div>
                  <p className="text-sm font-bold text-white">
                    Personalized styling
                  </p>

                  <p className="text-xs text-white/55">
                    Designed around your look
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            EXPERIENCE
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute inset-0 z-20
            flex items-center justify-end
          "
          style={{
            opacity: experienceOpacity,
            transform: `translateY(${
              (1 - experienceProgress) *
              45
            }px)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8 lg:px-12">
            <div className="max-w-lg text-left lg:text-right">
              <div
                className="
                  mb-4
                  inline-flex
                  items-center gap-2
                  rounded-full
                  border border-purple-300/20
                  bg-[#100719]/40
                  px-4 py-2
                  backdrop-blur-sm
                "
              >
                <Sparkles
                  className="
                    h-4 w-4
                    text-[#c084fc]
                  "
                />

                <span
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#e9d5ff]
                  "
                >
                  Premium Experience
                </span>
              </div>

              <h2
                className="
                  text-4xl
                  font-black
                  leading-[0.98]
                  tracking-[-0.04em]
                  text-white
                  drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]
                  sm:text-6xl
                "
              >
                MORE THAN

                <span
                  className="
                    block
                    text-[#a855f7]
                    drop-shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                  "
                >
                  A SALON.
                </span>
              </h2>

              <p
                className="
                  mt-5
                  text-base
                  leading-7
                  text-purple-100/75
                  drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)]
                "
              >
                A space where modern style,
                personal care and relaxation come
                together. Whether you're here for
                a fresh cut, a new colour or a
                complete transformation, you're
                in good hands.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            FINAL
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute inset-0 z-20
            flex items-center
          "
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
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.26em]
                  text-[#c084fc]
                  drop-shadow-[0_3px_15px_rgba(0,0,0,0.9)]
                "
              >
                B Style Unisex Salon
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                  font-black
                  leading-[0.96]
                  tracking-[-0.05em]
                  text-white
                  drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                LOOK GOOD.

                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-[#f5eaff]
                    via-[#c084fc]
                    to-[#7c3aed]
                    bg-clip-text
                    text-transparent
                    drop-shadow-[0_10px_30px_rgba(124,58,237,0.3)]
                  "
                >
                  FEEL AMAZING.
                </span>
              </h2>

              <p
                className="
                  mt-6
                  max-w-lg
                  text-base
                  leading-7
                  text-purple-100/80
                  drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)]
                  sm:text-lg
                "
              >
                Your next look starts here.
                Reserve your time and let our
                stylists create something made
                just for you.
              </p>

              <div className="pointer-events-auto mt-8">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="
                    group
                    inline-flex
                    cursor-pointer
                    items-center gap-2
                    rounded-full
                    bg-white
                    px-7 py-3.5
                    text-sm
                    font-extrabold
                    text-[#21102f]
                    shadow-[0_18px_45px_rgba(192,132,252,0.18)]
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#f5eaff]
                    hover:shadow-[0_22px_55px_rgba(192,132,252,0.28)]
                  "
                >
                  Book Now

                  <ArrowRight
                    className="
                      h-4 w-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
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