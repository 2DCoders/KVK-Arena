import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  BicepsFlexed,
  Dumbbell,
  HeartPulse,
  UserRoundCheck,
} from "lucide-react";

const frameModules = import.meta.glob(
  "/src/assets/gym-scroll/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
) as Record<string, string>;

type Service = {
  number: string;
  label: string;
  title: string;
  highlightedTitle: string;
  description: string;
  icon: typeof Dumbbell;
  features: string[];
};

const services: Service[] = [
  {
    number: "01",
    label: "Strength Training",
    title: "Build Strength.",
    highlightedTitle: "Lift with Confidence.",
    description:
      "Train with premium free weights and structured strength exercises designed to improve power, endurance and overall performance.",
    icon: Dumbbell,
    features: [
      "Premium free weights",
      "Strength-focused training",
      "Progressive performance",
    ],
  },
  {
    number: "02",
    label: "Functional Fitness",
    title: "Move Better.",
    highlightedTitle: "Perform Stronger.",
    description:
      "Challenge your body with dynamic workouts that improve mobility, stability, coordination and everyday athletic performance.",
    icon: Activity,
    features: [
      "Full-body workouts",
      "Mobility and coordination",
      "Improved endurance",
    ],
  },
  {
    number: "03",
    label: "Mindful Movement",
    title: "Balance Your Body.",
    highlightedTitle: "Calm Your Mind.",
    description:
      "Recharge with guided yoga sessions focused on flexibility, posture, controlled breathing and mental wellness.",
    icon: HeartPulse,
    features: [
      "Guided yoga sessions",
      "Flexibility and posture",
      "Mind and body balance",
    ],
  },
  {
    number: "04",
    label: "Personal Coaching",
    title: "Expert Guidance.",
    highlightedTitle: "Better Results.",
    description:
      "Work with experienced trainers who support your technique, monitor your progress and help you reach your goals safely.",
    icon: UserRoundCheck,
    features: [
      "Professional guidance",
      "Correct exercise technique",
      "Personalized support",
    ],
  },
];

function getFrameNumber(path: string) {
  const match = path.match(/(\d+)(?=\.[^.]+$)/);

  return match ? Number(match[1]) : 0;
}

export default function GymScrollServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const renderedFrameRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);

  const frames = useMemo(() => {
    return Object.entries(frameModules)
      .sort(([pathA], [pathB]) => {
        return getFrameNumber(pathA) - getFrameNumber(pathB);
      })
      .map(([, url]) => url);
  }, []);

  const totalFrames = frames.length;

  const loadProgress =
    totalFrames > 0
      ? Math.round((loadedFrames / totalFrames) * 100)
      : 0;

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frameIndex];

    if (!canvas || !image || !image.complete || !image.naturalWidth) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth = Math.max(1, rect.width);
    const displayHeight = Math.max(1, rect.height);

    const targetWidth = Math.floor(displayWidth * pixelRatio);
    const targetHeight = Math.floor(displayHeight * pixelRatio);

    if (
      canvas.width !== targetWidth ||
      canvas.height !== targetHeight
    ) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );

    context.clearRect(
      0,
      0,
      displayWidth,
      displayHeight
    );

    const scale = Math.min(
      displayWidth / image.naturalWidth,
      displayHeight / image.naturalHeight
    );

    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    const x = (displayWidth - drawWidth) / 2;
    const y = (displayHeight - drawHeight) / 2;

    // Keep this white because the generated animation
    // has a pure white studio background.
    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      displayWidth,
      displayHeight
    );

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      image,
      x,
      y,
      drawWidth,
      drawHeight
    );

    renderedFrameRef.current = frameIndex;
  };

  useEffect(() => {
    if (!totalFrames) {
      return;
    }

    let cancelled = false;
    let loaded = 0;

    imagesRef.current = frames.map((src, index) => {
      const image = new Image();

      image.decoding = "async";
      image.src = src;

      image.onload = () => {
        if (cancelled) {
          return;
        }

        loaded += 1;
        setLoadedFrames(loaded);

        if (index === 0) {
          drawFrame(0);
        }
      };

      return image;
    });

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [frames, totalFrames]);

  useEffect(() => {
    const updateScrollAnimation = () => {
      animationFrameRef.current = null;

      const section = sectionRef.current;

      if (!section || !totalFrames) {
        return;
      }

      const rect = section.getBoundingClientRect();

      const scrollableDistance =
        section.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) {
        return;
      }

      const travelledDistance = -rect.top;

      const progress = Math.min(
        Math.max(
          travelledDistance / scrollableDistance,
          0
        ),
        1
      );

      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(progress * totalFrames)
      );

      const sceneIndex = Math.min(
        services.length - 1,
        Math.floor(progress * services.length)
      );

      setScrollProgress(progress);
      setActiveScene(sceneIndex);

      if (renderedFrameRef.current !== frameIndex) {
        drawFrame(frameIndex);
      }
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(
          updateScrollAnimation
        );
    };

    const handleResize = () => {
      renderedFrameRef.current = -1;
      updateScrollAnimation();
    };

    updateScrollAnimation();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, [totalFrames]);

  const currentService = services[activeScene];
  const CurrentIcon = currentService.icon;

  const currentSceneProgress = Math.min(
    1,
    Math.max(
      0,
      scrollProgress * services.length - activeScene
    )
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#05070b]"
      style={{
        height: `${services.length * 115}vh`,
      }}
    >
      <div className="sticky top-0 min-h-screen overflow-hidden bg-[#05070b]">
        {/* Background effects */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-48 top-10 h-[520px] w-[520px] rounded-full bg-[#296BE1]/15 blur-[140px]" />

          <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#296BE1]/10 blur-[150px]" />

          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[100px]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:62px_62px] opacity-50" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#05070b_82%)]" />
        </div>

        <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1500px] px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14 lg:px-12 xl:px-16">
  {/* Content */}
  <div className="relative z-20 flex min-h-screen items-center pb-16 pt-24 lg:min-h-0 lg:pb-0 lg:pt-0">
    <div
      key={activeScene}
      className="w-full max-w-xl animate-[gymContentIn_650ms_cubic-bezier(0.22,1,0.36,1)]"
    >
      {/* Mobile spacing for floating player */}
      <div className="pr-28 sm:pr-40 lg:pr-0">
        <div className="mb-6 flex items-center gap-3 lg:mb-7 lg:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#296BE1]/30 bg-[#296BE1]/10 text-[#4d87ef] shadow-[0_0_35px_rgba(41,107,225,0.15)] sm:h-12 sm:w-12 sm:rounded-2xl">
            <CurrentIcon
              size={20}
              strokeWidth={2}
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4d87ef] sm:text-xs sm:tracking-[0.25em]">
              {currentService.label}
            </p>

            <p className="mt-1 text-[10px] font-medium text-white/35 sm:text-xs">
              KVK Gym Experience
            </p>
          </div>
        </div>

        <h2 className="max-w-xl text-4xl font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl xl:text-6xl">
          <span className="block">
            {currentService.title}
          </span>

          <span className="mt-2 block bg-gradient-to-r from-[#6b9cff] via-[#3d7df0] to-[#296BE1] bg-clip-text text-transparent">
            {currentService.highlightedTitle}
          </span>
        </h2>
      </div>

      <p className="mt-7 max-w-lg text-sm leading-7 text-white/55 sm:text-lg sm:leading-8">
        {currentService.description}
      </p>

      <div className="mt-7 grid gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3">
        {currentService.features.map((feature) => (
          <div
            key={feature}
            className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 backdrop-blur-xl transition duration-300 hover:border-[#296BE1]/30 hover:bg-[#296BE1]/[0.08] sm:rounded-2xl sm:py-3.5"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4d87ef] shadow-[0_0_12px_rgba(77,135,239,0.9)]" />

            <span className="text-xs font-semibold leading-5 text-white/65 transition-colors group-hover:text-white">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 sm:mt-10 sm:gap-4">
        <div className="h-[2px] w-12 overflow-hidden rounded-full bg-white/10 sm:w-14">
          <div
            className="h-full origin-left bg-[#296BE1]"
            style={{
              transform: `scaleX(${currentSceneProgress})`,
            }}
          />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 sm:text-xs sm:tracking-[0.18em]">
          Scroll to explore
        </p>

        <ArrowDown
          size={14}
          className="animate-bounce text-[#4d87ef]"
        />
      </div>
    </div>
  </div>

  {/* Frame animation */}
  <div
    className="
      absolute right-4 top-20 z-40
      h-40 w-28
      sm:right-8 sm:top-24 sm:h-52 sm:w-40
      lg:relative lg:right-auto lg:top-auto lg:z-20
      lg:flex lg:min-h-[78vh] lg:w-full lg:items-center lg:justify-center
    "
  >
    <div className="absolute inset-x-2 bottom-0 h-10 rounded-full bg-[#296BE1]/25 blur-[25px] lg:inset-x-10 lg:bottom-3 lg:h-24 lg:blur-[60px]" />

    <div
      className="
        relative h-full w-full overflow-hidden
        rounded-2xl border border-white/15 bg-white
        shadow-[0_18px_55px_rgba(0,0,0,0.75),0_0_35px_rgba(41,107,225,0.2)]
        lg:h-[78vh] lg:rounded-[3rem]
        lg:shadow-[0_35px_100px_rgba(0,0,0,0.55),0_0_70px_rgba(41,107,225,0.1)]
      "
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full bg-white"
        aria-label={`${currentService.label} animation`}
      />

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/30 to-transparent lg:h-24" />

      {loadedFrames < totalFrames && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          {/* Compact mobile loading */}
          <div className="text-center lg:hidden">
            <BicepsFlexed
              size={20}
              className="mx-auto animate-pulse text-[#296BE1]"
            />

            <p className="mt-2 text-[9px] font-bold text-slate-900">
              {loadProgress}%
            </p>
          </div>

          {/* Full desktop loading */}
          <div className="hidden w-56 text-center lg:block">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#296BE1]/10 text-[#296BE1]">
              <BicepsFlexed
                size={26}
                className="animate-pulse"
              />
            </div>

            <p className="text-sm font-bold text-slate-950">
              Loading fitness experience
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#296BE1] transition-[width] duration-300"
                style={{
                  width: `${loadProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs font-medium text-slate-400">
              {loadProgress}%
            </p>
          </div>
        </div>
      )}

      {/* Mobile scene number */}
      <div className="pointer-events-none absolute left-2 top-2 rounded-lg bg-black/80 px-2 py-1.5 backdrop-blur-lg lg:hidden">
        <p className="text-[8px] font-black text-[#6b9cff]">
          {currentService.number}
        </p>
      </div>

      {/* Desktop scene badge */}
      <div className="pointer-events-none absolute left-6 top-6 hidden rounded-2xl border border-black/[0.07] bg-black/80 px-4 py-3 shadow-xl backdrop-blur-xl lg:block">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
          Service
        </p>

        <p className="mt-1 text-xl font-black text-[#6b9cff]">
          {currentService.number}
        </p>
      </div>

      {/* Mobile service label */}
      <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex items-center justify-between rounded-lg bg-black/85 px-2 py-1.5 backdrop-blur-lg lg:hidden">
        <div className="flex min-w-0 items-center gap-1">
          <CurrentIcon
            size={9}
            className="shrink-0 text-[#6b9cff]"
          />

          <p className="truncate text-[7px] font-bold uppercase tracking-[0.08em] text-white">
            {currentService.label}
          </p>
        </div>

        <p className="ml-1 shrink-0 text-[7px] font-semibold text-white/45">
          {activeScene + 1}/{services.length}
        </p>
      </div>

      {/* Desktop service label */}
      <div className="pointer-events-none absolute bottom-6 left-6 right-6 hidden items-center justify-between rounded-2xl border border-black/[0.06] bg-black/80 px-4 py-3 shadow-xl backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3">
          <CurrentIcon
            size={17}
            className="text-[#6b9cff]"
          />

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            {currentService.label}
          </p>
        </div>

        <p className="text-xs font-semibold text-white/40">
          {activeScene + 1} / {services.length}
        </p>
      </div>
    </div>

    {/* Desktop navigation only */}
    <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 xl:flex">
      {services.map((service, index) => {
        const Icon = service.icon;
        const isActive = activeScene === index;
        const isCompleted = activeScene > index;

        return (
          <div
            key={service.number}
            className="flex flex-col items-center"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
                isActive
                  ? "scale-110 border-[#4d87ef] bg-[#296BE1] text-white shadow-[0_0_35px_rgba(41,107,225,0.45)]"
                  : isCompleted
                    ? "border-[#296BE1]/30 bg-[#296BE1]/10 text-[#6b9cff]"
                    : "border-white/10 bg-[#0c1017]/80 text-white/30"
              }`}
            >
              <Icon size={18} />
            </div>

            {index < services.length - 1 && (
              <div className="relative my-2 h-10 w-px overflow-hidden bg-white/10">
                <div
                  className={`absolute inset-x-0 top-0 bg-[#296BE1] transition-all duration-500 ${
                    activeScene > index
                      ? "h-full"
                      : "h-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
</div>

        {/* Global scroll progress */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/[0.06]">
          <div
            className="h-full origin-left bg-gradient-to-r from-[#296BE1] to-[#73a1ff] shadow-[0_0_18px_rgba(41,107,225,0.9)]"
            style={{
              transform: `scaleX(${scrollProgress})`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes gymContentIn {
          0% {
            opacity: 0;
            transform: translateY(28px);
            filter: blur(6px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}