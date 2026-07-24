import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Bean,
  Coffee,
  HeartHandshake,
  Leaf,
  Sparkles,
  Timer,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 10;

const getFramePath = (frame: number) =>
  `/coffee-sequence/coffee-${String(frame).padStart(3, "0")}.webp`;

const leftFeatures = [
  {
    icon: Bean,
    title: "Fresh Beans",
    description: "Carefully selected and roasted for a rich, balanced flavour.",
  },
  {
    icon: Leaf,
    title: "Sustainable",
    description: "Responsibly sourced coffee with quality at every step.",
  },
  {
    icon: Sparkles,
    title: "Unique Blends",
    description: "Distinct flavours crafted to suit every coffee preference.",
  },
  {
    icon: Coffee,
    title: "Cozy Space",
    description: "A warm and comfortable place to relax, work or connect.",
  },
];

const rightFeatures = [
  {
    icon: Users,
    title: "Community",
    description: "A welcoming space made for conversations and shared moments.",
  },
  {
    icon: Timer,
    title: "Fast Service",
    description: "Prompt, friendly service without compromising quality.",
  },
  {
    icon: UtensilsCrossed,
    title: "Perfect Match",
    description: "Fresh coffee paired with delicious pastries and light bites.",
  },
  {
    icon: HeartHandshake,
    title: "Crafted With Care",
    description: "Every cup is prepared with passion, precision and attention.",
  },
];

type FeatureItem = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function FeatureCard({
  feature,
  align = "left",
}: {
  feature: FeatureItem;
  align?: "left" | "right";
}) {
  const Icon = feature.icon;

  return (
    <div
      className={`group flex items-start gap-4 ${
        align === "right" ? "lg:flex-row-reverse lg:text-right" : ""
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ead8c8] bg-[#fffaf5] text-[#8a4d2b] shadow-[0_10px_30px_rgba(104,61,36,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#d8b390] group-hover:bg-[#f8eadc]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-[#2b1a12] sm:text-xl">
          {feature.title}
        </h3>

        <div
          className={`mt-2 h-px w-full bg-gradient-to-r ${
            align === "right"
              ? "from-transparent via-[#d9b89c] to-[#a86b45] lg:bg-gradient-to-l"
              : "from-[#a86b45] via-[#d9b89c] to-transparent"
          }`}
        />

        <p className="mt-3 text-sm leading-6 text-[#75665d]">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function CoffeeImageSequence({
  triggerRef,
}: {
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const trigger = triggerRef.current;

    if (!canvas || !wrapper || !trigger) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const images: HTMLImageElement[] = [];
    const sequence = {
      frame: 0,
    };

    let currentImage: HTMLImageElement | null = null;
    let destroyed = false;

    const drawFrame = () => {
      if (destroyed) return;

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(sequence.frame)),
      );

      const image = images[frameIndex] || currentImage;

      if (!image || !image.complete || image.naturalWidth === 0) return;

      currentImage = image;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const scale = Math.min(
        canvasWidth / image.naturalWidth,
        canvasHeight / image.naturalHeight,
      );

      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;

      const x = (canvasWidth - width) / 2;
      const y = (canvasHeight - height) / 2;

      context.drawImage(image, x, y, width, height);
    };

    const resizeCanvas = () => {
      const bounds = wrapper.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);

      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;

      drawFrame();
    };

    for (let index = 0; index < FRAME_COUNT; index++) {
      const image = new Image();

      image.src = getFramePath(index + 1);

      image.onload = () => {
        if (index === 0) {
          currentImage = image;
          resizeCanvas();
        }
      };

      image.onerror = () => {
        console.error(`Unable to load frame: ${image.src}`);
      };

      images.push(image);
    }

    const animation = gsap.to(sequence, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      onUpdate: drawFrame,
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(wrapper);

    window.addEventListener("resize", resizeCanvas);

    return () => {
      destroyed = true;

      animation.kill();
      animation.scrollTrigger?.kill();

      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [triggerRef]);

  return (
    <div ref={wrapperRef} className="relative h-[420px] w-full sm:h-[500px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-label="Animated iced coffee"
      />
    </div>
  );
}

export default function CafeServices() {
  const animationSectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#fffdf9] py-20 sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#efd8c3]/35 blur-[110px]" />

      <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#f4e6d7]/70 blur-[120px]" />

      <div className="pointer-events-none absolute left-10 top-24 hidden h-24 w-24 rotate-12 rounded-full border border-[#9d6a48]/10 lg:block" />

      <div className="pointer-events-none absolute bottom-24 right-14 hidden h-16 w-16 rounded-full border border-[#9d6a48]/10 lg:block" />

      {/* Heading */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8d4c2] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9b5b37] shadow-sm">
            <Coffee className="h-4 w-4" />
            About our cafe
          </span>

          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#2a1710] sm:text-4xl lg:text-5xl">
            More than coffee,
            <span className="block text-[#a8663e]">it is an experience.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#74645a] sm:text-base">
            We bring together quality ingredients, thoughtful preparation and a
            welcoming atmosphere to create memorable moments in every cup.
          </p>
        </div>
      </div>

      {/* Scroll animation area */}
      <div ref={animationSectionRef} className="relative mt-12 min-h-[50vh]">
        <div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-10">
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr_1fr] lg:gap-8 xl:gap-12">
              {/* Left features */}
              <div className="space-y-8 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0 lg:block lg:space-y-10">
                {leftFeatures.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>

              {/* Middle animation */}
              <div className="relative mx-auto flex w-full max-w-[430px] items-center justify-center">
                <div className="absolute h-[75%] w-[75%] rounded-full bg-[#f3dfcd] blur-[50px]" />

                <div className="absolute inset-x-8 bottom-4 h-16 rounded-[50%] bg-[#8b5a3c]/10 blur-2xl" />

                <div className="relative flex min-h-[420px] w-full items-center justify-center sm:min-h-[500px]">
                  <div className="absolute inset-6 rounded-[48%] border border-[#d9b89c]/25" />

                  <div className="absolute inset-12 rounded-[48%] border border-dashed border-[#c79672]/20" />

                  <div className="relative z-10 w-full">
                    <CoffeeImageSequence triggerRef={animationSectionRef} />
                  </div>

                  <div className="absolute left-4 top-12 z-20 hidden rounded-2xl border border-[#ead8c8] bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(80,48,29,0.1)] backdrop-blur-md sm:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a76841]">
                      Freshly made
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#2c1a12]">
                      Every single cup
                    </p>
                  </div>

                  <div className="absolute bottom-14 right-0 z-20 hidden rounded-2xl border border-[#ead8c8] bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(80,48,29,0.1)] backdrop-blur-md sm:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a76841]">
                      Premium quality
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#2c1a12]">
                      Crafted with care
                    </p>
                  </div>
                </div>
              </div>

              {/* Right features */}
              <div className="space-y-8 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0 lg:block lg:space-y-10">
                {rightFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.title}
                    feature={feature}
                    align="right"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#eaded3] bg-white shadow-[0_22px_65px_rgba(83,51,31,0.08)] sm:grid-cols-3">
          <div className="px-6 py-7 text-center sm:border-r sm:border-[#eee3da]">
            <p className="text-3xl font-black text-[#8d4f2e]">100%</p>

            <p className="mt-2 text-sm font-medium text-[#77675d]">
              Freshly prepared
            </p>
          </div>

          <div className="border-y border-[#eee3da] px-6 py-7 text-center sm:border-y-0 sm:border-r">
            <p className="text-3xl font-black text-[#8d4f2e]">Premium</p>

            <p className="mt-2 text-sm font-medium text-[#77675d]">
              Quality ingredients
            </p>
          </div>

          <div className="px-6 py-7 text-center">
            <p className="text-3xl font-black text-[#8d4f2e]">Daily</p>

            <p className="mt-2 text-sm font-medium text-[#77675d]">
              Warm and welcoming service
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
