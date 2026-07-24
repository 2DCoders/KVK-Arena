import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, LoaderCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 151;

const getFramePath = (frame: number) => {
  const frameNumber = String(frame).padStart(3, "0");

  return `/sequence/ezgif-frame-${frameNumber}.png`;
};

const scenes = [
  {
    start: 0,
    end: 0.17,
    label: "Welcome to KVK Arena",
    title: "Everything you need, all in one arena.",
    description:
      "Fitness, sports, entertainment, vehicle care and café experiences connected in one premium destination.",
    alignment: "left",
  },
  {
    start: 0.17,
    end: 0.34,
    label: "Gym & Fitness",
    title: "Build strength. Become better.",
    description:
      "Train in a modern fitness environment designed for performance, consistency and progress.",
    alignment: "right",
  },
  {
    start: 0.34,
    end: 0.51,
    label: "Badminton",
    title: "Your court. Your game.",
    description:
      "Reserve your preferred court and playing time through a simple online booking experience.",
    alignment: "left",
  },
  {
    start: 0.51,
    end: 0.68,
    label: "Gaming Centre",
    title: "Play. Compete. Connect.",
    description:
      "Enjoy high-performance PCs, PlayStation gaming, pool tables and private entertainment spaces.",
    alignment: "right",
  },
  {
    start: 0.68,
    end: 0.84,
    label: "Premium Car Wash",
    title: "Professional care for every drive.",
    description:
      "Give your vehicle the treatment it deserves with premium washing, detailing and care packages.",
    alignment: "left",
  },
  {
    start: 0.84,
    end: 1.01,
    label: "KVK Café",
    title: "Relax. Recharge. Enjoy.",
    description:
      "Complete your experience with freshly prepared coffee, drinks, pastries and delicious food.",
    alignment: "right",
  },
];

export default function Sample() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ current: 1 });
  const animationFrameRef = useRef<number | null>(null);

  const [activeScene, setActiveScene] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  const drawFrame = (frameNumber: number) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frameNumber - 1];

    if (!canvas || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerHeight * pixelRatio;

    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, containerWidth, containerHeight);

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = containerWidth / containerHeight;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    // object-cover behaviour
    if (imageRatio > canvasRatio) {
      drawHeight = containerHeight;
      drawWidth = drawHeight * imageRatio;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = containerWidth;
      drawHeight = drawWidth / imageRatio;
      drawX = 0;
      drawY = (containerHeight - drawHeight) / 2;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );
  };

  const requestFrameRender = (frameNumber: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      drawFrame(frameNumber);
    });
  };

  // Preload all frames
  useEffect(() => {
    let isCancelled = false;
    let completedCount = 0;
    let successfulCount = 0;

    const images: HTMLImageElement[] = Array.from(
      { length: FRAME_COUNT },
      () => new Image(),
    );

    imagesRef.current = images;

    const handleCompletedImage = () => {
      completedCount += 1;

      if (!isCancelled) {
        setLoadingProgress(
          Math.round((completedCount / FRAME_COUNT) * 100),
        );
      }

      if (completedCount === FRAME_COUNT && !isCancelled) {
        if (successfulCount === 0) {
          setLoadError(
            "The image sequence could not be loaded. Check the public/kvk-sequence folder and file names.",
          );

          return;
        }

        setIsLoaded(true);
        requestFrameRender(1);
      }
    };

    images.forEach((image, index) => {
      image.decoding = "async";
      image.src = getFramePath(index + 1);

      image.onload = () => {
        successfulCount += 1;

        if (index === 0 && !isCancelled) {
          requestFrameRender(1);
        }

        handleCompletedImage();
      };

      image.onerror = () => {
        console.error(
          `Failed to load frame: ${getFramePath(index + 1)}`,
        );

        handleCompletedImage();
      };
    });

    return () => {
      isCancelled = true;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Connect scrolling to canvas frames
  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !isLoaded) {
      return;
    }

    const context = gsap.context(() => {
      gsap.to(frameRef.current, {
        current: FRAME_COUNT,
        ease: "none",
        snap: {
          current: 1,
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          invalidateOnRefresh: true,

          onUpdate: (scrollTrigger) => {
            const frameNumber = Math.min(
              FRAME_COUNT,
              Math.max(1, Math.round(frameRef.current.current)),
            );

            requestFrameRender(frameNumber);

            const progress = scrollTrigger.progress;

            const sceneIndex = scenes.findIndex(
              (scene) =>
                progress >= scene.start && progress < scene.end,
            );

            setActiveScene(
              sceneIndex === -1 ? scenes.length - 1 : sceneIndex,
            );
          },
        },
      });
    }, section);

    const handleResize = () => {
      requestFrameRender(
        Math.round(frameRef.current.current),
      );

      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      context.revert();
    };
  }, [isLoaded]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-[700vh] bg-black"
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-black">
          {/* Image sequence */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block h-full w-full"
            aria-label="KVK Arena scroll experience"
          />

          {/* Dark overlays for text readability */}
          <div className="pointer-events-none absolute inset-0 bg-black/30" />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.22)_45%,rgba(0,0,0,0.55)_100%)]" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/65 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Loader */}
          {!isLoaded && !loadError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#080808] px-6">
              <div className="w-full max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <LoaderCircle
                    className="animate-spin text-red-500"
                    size={26}
                  />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Preparing your experience
                </p>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-red-600 transition-[width] duration-300"
                    style={{
                      width: `${loadingProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-white/70">
                  {loadingProgress}%
                </p>
              </div>
            </div>
          )}

          {/* Loading error */}
          {loadError && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black px-6">
              <div className="max-w-lg text-center">
                <h2 className="text-2xl font-semibold text-white">
                  Unable to load the image sequence
                </h2>

                <p className="mt-4 leading-7 text-white/60">
                  {loadError}
                </p>

                <code className="mt-5 block rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-red-300">
                  public/kvk-sequence/ezgif-frame-001.png
                </code>
              </div>
            </div>
          )}

          {/* Brand header */}
          <div className="absolute inset-x-0 top-0 z-30">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-12">
              <div>
                <p className="text-lg font-bold tracking-[0.16em] text-white">
                  KVK ARENA
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/45">
                  One destination. Every experience.
                </p>
              </div>

              <span className="hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md sm:inline-flex">
                Scroll Experience
              </span>
            </div>
          </div>

          {/* Scene content */}
          <div className="relative z-20 mx-auto h-full w-full max-w-7xl px-6 sm:px-8 lg:px-12">
            {scenes.map((scene, index) => {
              const isActive = activeScene === index;
              const isRightAligned =
                scene.alignment === "right";

              return (
                <div
                  key={scene.label}
                  className={`absolute left-6 right-6 top-1/2 max-w-2xl -translate-y-1/2 transition-all duration-700 ease-out sm:left-8 sm:right-8 lg:left-12 lg:right-12 ${
                    isRightAligned
                      ? "ml-auto text-right"
                      : "mr-auto text-left"
                  } ${
                    isActive
                      ? "pointer-events-auto translate-x-0 opacity-100"
                      : `pointer-events-none opacity-0 ${
                          isRightAligned
                            ? "translate-x-12"
                            : "-translate-x-12"
                        }`
                  }`}
                >
                  <div
                    className={`mb-5 flex items-center gap-3 ${
                      isRightAligned
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!isRightAligned && (
                      <span className="h-px w-10 bg-red-500" />
                    )}

                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-400 sm:text-sm">
                      {scene.label}
                    </p>

                    {isRightAligned && (
                      <span className="h-px w-10 bg-red-500" />
                    )}
                  </div>

                  <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
                    {scene.title}
                  </h1>

                  <p
                    className={`mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 ${
                      isRightAligned ? "ml-auto" : ""
                    }`}
                  >
                    {scene.description}
                  </p>

                  {index === scenes.length - 1 && (
                    <div
                      className={`mt-8 flex flex-wrap gap-3 ${
                        isRightAligned
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                      >
                        Explore KVK Arena
                        <ArrowRight size={17} />
                      </button>

                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                      >
                        Become a Member
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right navigation */}
          <div className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex lg:right-8">
            {scenes.map((scene, index) => (
              <div
                key={scene.label}
                className="flex items-center gap-3"
              >
                <span
                  className={`text-xs font-medium text-white/65 transition-all duration-300 ${
                    activeScene === index
                      ? "translate-x-0 opacity-100"
                      : "translate-x-2 opacity-0"
                  }`}
                >
                  {scene.label}
                </span>

                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeScene === index
                      ? "h-8 w-1 bg-red-500"
                      : "h-2 w-1 bg-white/30"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          {activeScene === 0 && isLoaded && (
            <div className="absolute bottom-9 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60">
              <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em]">
                Scroll to explore
              </span>

              <ArrowDown
                className="animate-bounce"
                size={18}
              />
            </div>
          )}

          {/* Progress line */}
          <div className="absolute inset-x-0 bottom-0 z-40 h-1 bg-white/10">
            <div
              className="h-full bg-red-600 transition-[width] duration-300"
              style={{
                width: `${
                  ((activeScene + 1) / scenes.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Normal content after scroll animation */}
      <section className="bg-white px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
            The complete experience
          </p>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              More than a destination. A complete lifestyle
              experience.
            </h2>

            <p className="max-w-xl leading-7 text-slate-600 lg:ml-auto">
              Continue the rest of your KVK Arena landing page
              here with services, memberships, pricing,
              testimonials and contact information.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}