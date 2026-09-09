import Girl from "@/assets/coffee-girl.png";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Croissant,
  Flame,
  Quote,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPortal } from "react-dom";
import {
  getCafeMenu,
  type CafeMenuResponse,
} from "@/services/cafe-service-api";

gsap.registerPlugin(ScrollTrigger);

type PopularChoice = {
  id: string | number;
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  category: string;
  preparationTime: string;
  serving: string;
  includes: string[];
  image?: string;
};

const getImageSource = (image?: string | null) => {
  if (!image) return undefined;
  if (image.startsWith("data:image/")) return image;
  return `data:image/png;base64,${image}`;
};

const mapCafeMenuItem = (item: CafeMenuResponse): PopularChoice => ({
  id: item.id,
  name: item.name,
  description: item.description ?? "Freshly prepared at our cafe.",
  fullDescription: item.description ?? "Freshly prepared at our cafe.",
  price: `LKR ${item.price.toLocaleString("en-LK")}`,
  category: "Cafe Favourite",
  preparationTime: item.preparationTimeInMinutes
    ? `${item.preparationTimeInMinutes} min`
    : "Prepared to order",
  serving: item.portionSize ? `${item.portionSize} person` : "1 person",
  includes: item.ingredients
    ? item.ingredients.split(",").map((ingredient) => ingredient.trim())
    : [],
  image: getImageSource(item.image),
});

export default function CafeJourney() {
  const [selectedChoice, setSelectedChoice] = useState<PopularChoice | null>(
    null,
  );
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<PopularChoice[]>([]);

  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const handleOpenDetails = (item: PopularChoice) => {
    setSelectedChoice(item);
  };

  const handleGetCafeMenu = async () => {
    try {
      const response = await getCafeMenu(1);
      const items = Array.isArray(response.data) ? response.data : [response.data];
      const activeItems = items.filter((item) => item.isActive).map(mapCafeMenuItem);

      if (activeItems.length > 0) {
        setMenuItems(activeItems);
      }
    } catch (error) {
      console.error("Error fetching cafe menu:", error);
    }
  };

  useEffect(() => {
    void handleGetCafeMenu();
  }, []);

  const handleCloseDetails = () => {
    setSelectedChoice(null);
  };

  const handleOpenFullMenu = () => {
    setIsFullMenuOpen(true);
  };

  const handleCloseFullMenu = () => {
    setIsFullMenuOpen(false);
  };

  useEffect(() => {
  if (!selectedChoice && !isFullMenuOpen) return;

  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSelectedChoice(null);
      setIsFullMenuOpen(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isFullMenuOpen, selectedChoice]);

  useEffect(() => {
    const section = horizontalSectionRef.current;
    const track = horizontalTrackRef.current;

    // Run the horizontal pinned animation only on desktop/tablet.
    if (!section || !track || !window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    let refreshTimer: number | undefined;

    const ctx = gsap.context(() => {
      const getScrollDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const getPinDuration = () =>
        Math.max(getScrollDistance(), window.innerHeight * 0.35);

      // Use one controlled tween instead of creating a new tween every
      // refresh. This prevents stale tweens from fighting each other.
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        paused: true,
        overwrite: "auto",
      });

      const trigger = ScrollTrigger.create({
        trigger: section,
        animation: horizontalTween,
        start: "top top",
        end: () => `+=${getPinDuration()}`,
        scrub: 0.8,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        fastScrollEnd: false,
        preventOverlaps: true,
        refreshPriority: 1,
      });

      const refreshSafely = () => {
        window.clearTimeout(refreshTimer);

        refreshTimer = window.setTimeout(() => {
          if (!section.isConnected || !track.isConnected) return;

          // Reset before measuring so ScrollTrigger never measures an
          // already-translated track.
          gsap.set(track, { x: 0 });

          trigger.refresh();
          ScrollTrigger.refresh();
        }, 80);
      };

      refreshSafely();

      window.addEventListener("load", refreshSafely);
      window.addEventListener("resize", refreshSafely);
      window.addEventListener("orientationchange", refreshSafely);

      // Dynamic menu images/content can change the track width after mount.
      const resizeObserver = new ResizeObserver(refreshSafely);
      resizeObserver.observe(section);
      resizeObserver.observe(track);

      return () => {
        window.removeEventListener("load", refreshSafely);
        window.removeEventListener("resize", refreshSafely);
        window.removeEventListener("orientationchange", refreshSafely);
        resizeObserver.disconnect();
        window.clearTimeout(refreshTimer);

        trigger.kill();
        horizontalTween.kill();
      };
    }, section);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [menuItems.length]);

  return (
    <section
      id="breakfast"
      className="relative max-w-full overflow-x-clip overflow-y-hidden bg-[#21130c] text-white"
    >
      {/* Hero area */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(181,108,56,0.2),transparent_34%),radial-gradient(circle_at_10%_10%,rgba(121,65,34,0.13),transparent_25%)]" />

        <div className="pointer-events-none absolute -left-40 top-28 h-[480px] w-[480px] rounded-full border border-[#d79a63]/10" />

        <div className="pointer-events-none absolute -right-32 bottom-10 h-[520px] w-[520px] rounded-full border border-[#d79a63]/10" />

        <div className="pointer-events-none absolute left-[48%] top-24 hidden h-24 w-24 rounded-full bg-[#d38443]/10 blur-2xl lg:block" />

        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20">
          {/* Left content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a96a3b]/30 bg-[#21140d]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e4ad7a] backdrop-blur-md">
              <Coffee className="h-4 w-4" />
              Breakfast and coffee
            </div>

            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-[#fff8f0] sm:mt-7 sm:text-5xl lg:text-6xl xl:text-7xl">
              Begin your day
              <span className="mt-2 block text-[#d98745]">
                with something special.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#cbb9ab] sm:text-base">
              Enjoy freshly prepared breakfast favourites paired with rich,
              aromatic coffee. From buttery pastries to complete breakfast
              plates, every morning is crafted to feel warm, relaxed and
              memorable.
            </p>

            {/* Mini information */}
            <div className="mt-11 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9783d]/15 text-[#e59a61]">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">Fresh daily</p>
                    <p className="mt-1 text-xs text-[#a99587]">
                      Served every morning
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9783d]/15 text-[#e59a61]">
                    <Croissant className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Perfect pairing
                    </p>
                    <p className="mt-1 text-xs text-[#a99587]">
                      Breakfast and coffee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right image area */}
          <div className="relative mx-auto hidden min-h-[390px] w-full max-w-[620px] items-center justify-center sm:min-h-[560px] md:flex">
            <div className="absolute h-[320px] w-[320px] rounded-full border border-[#d18a50]/25 sm:h-[500px] sm:w-[500px]" />

            <div className="absolute h-[280px] w-[280px] rounded-full bg-gradient-to-br from-[#d68643] via-[#9b5129] to-[#4e2515] shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:h-[430px] sm:w-[430px]" />

            <div className="absolute h-[230px] w-[230px] rounded-full border border-white/10 sm:h-[350px] sm:w-[350px]" />

            <div className="absolute right-8 top-12 h-24 w-24 rounded-full bg-[#db8d4f]/20 blur-3xl" />

            <img
              src={Girl}
              alt="Customer enjoying breakfast and coffee"
              className="relative z-10 max-h-[590px] w-auto max-w-full object-contain drop-shadow-[0_35px_38px_rgba(0,0,0,0.45)]"
            />

            {/* Floating review */}
            <div className="absolute right-0 top-24 z-20 hidden w-[210px] rounded-2xl border border-white/10 bg-[#1e130d]/90 p-4 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:block">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d98745]/15 text-[#e49b63]">
                  <Quote className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Amazing taste</p>

                  <p className="mt-1 text-xs leading-5 text-[#bda99a]">
                    The perfect start to my morning.
                  </p>

                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-3 w-3 fill-[#f0a548] text-[#f0a548]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating service */}
            <div className="absolute left-0 top-[42%] z-20 hidden rounded-2xl border border-white/10 bg-[#1e130d]/90 px-4 py-3 shadow-[0_20px_55px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d98745]/15 text-[#e49b63]">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-[#a99485]">Quick service</p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  Fresh and fast
                </p>
              </div>
            </div>

            {/* Floating item */}
            {menuItems[0] && (
              <div className="absolute bottom-12 right-10 z-20 hidden w-[230px] rounded-2xl border border-white/10 bg-[#1e130d]/90 p-3 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl md:block">
                <div className="flex items-center gap-3">
                  {menuItems[0].image && (
                    <div className="h-16 w-16 overflow-hidden rounded-xl">
                      <img
                        src={menuItems[0].image}
                        alt={menuItems[0].name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#d9894d]">
                      Guest favourite
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-white">
                      Classic breakfast
                    </p>

                    <p className="mt-1 text-xs text-[#a99485]">
                      Served with coffee
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-16 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-[#d98a4c]/20 bg-[#d98a4c]/10 text-[#eaa56d] backdrop-blur-md">
              <Coffee className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal choices section */}
      <div
        ref={horizontalSectionRef}
        className="relative isolate z-20 overflow-x-clip border-t border-white/10 bg-[#21130c] md:min-h-screen"
      >
        <div className="cafe-journey-content flex flex-col justify-center py-16 md:h-screen md:py-0">
          {/* Title */}
          <div className="mx-auto mb-8 flex w-full max-w-7xl items-end justify-between px-5 sm:mb-10 sm:px-8 lg:px-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d8894d]">
                <Flame className="h-4 w-4" />
                Customer favourites
              </div>

              <h3 className="mt-4 max-w-[18rem] text-3xl font-black tracking-[-0.04em] text-white sm:max-w-none sm:text-4xl lg:text-5xl">
                Popular breakfast choices
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#a9978a] sm:text-base">
                Scroll to explore our most-loved breakfast dishes, freshly
                prepared and ready to pair with your favourite coffee.
              </p>
            </div>

            <div className="hidden items-center gap-3 text-sm font-semibold text-[#d8894d] sm:flex">
              Scroll to explore
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>

          {/* Horizontal track */}
          <div
            ref={horizontalTrackRef}
            className="flex max-w-full flex-col gap-5 px-5 sm:gap-6 sm:pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] sm:pr-[10vw] md:w-max md:flex-row md:px-0 md:will-change-transform"
          >
            {menuItems.map((item, index) => (
              <article
                key={item.id}
                className="cafe-choice-card group relative h-[390px] w-full max-w-full shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#18100b] shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:h-[430px] sm:w-[360px] md:w-[360px] lg:h-[470px] lg:w-[390px]"
              >
                <div className="absolute inset-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#110b07] via-[#110b07]/35 to-transparent" />
                </div>

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#e59a61]" />
                  {item.category}
                </div>

                <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-sm font-black text-white backdrop-blur-md">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#df9157]">
                    {item.price}
                  </p>

                  <h4 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                    {item.name}
                  </h4>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#c3b2a5]">
                    {item.description}
                  </p>

                  <button
  type="button"
  onClick={() => handleOpenDetails(item)}
  className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-white transition hover:text-[#e59a61]"
>
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}

            {/* Ending card */}
            <div className="cafe-choice-card flex h-[390px] w-full shrink-0 items-center justify-center rounded-[2rem] border border-dashed border-[#bc7442]/35 bg-[#18100b]/70 p-8 text-center sm:h-[430px] sm:w-[300px] lg:h-[470px]">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9783d]/15 text-[#e59a61]">
                  <Users className="h-7 w-7" />
                </div>

                <h4 className="mt-6 text-2xl font-black text-white">
                  More to discover
                </h4>

                <p className="mt-3 text-sm leading-6 text-[#a99587]">
                  Visit our cafe and explore the complete breakfast and coffee
                  menu.
                </p>

                <button
                  type="button"
                  onClick={handleOpenFullMenu}
                  className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#c9783d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#dd8b4c]"
                >
                  View full menu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress line */}
          <div className="mx-auto mt-8 w-full max-w-7xl px-5 sm:mt-10 sm:px-8 lg:px-12 md:block">
            <div className="h-px w-full bg-white/10">
              <div className="h-px w-1/3 bg-gradient-to-r from-[#d17f43] to-[#f0b178]" />
            </div>
          </div>
        </div>
      </div>

      {selectedChoice &&
  createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakfast-modal-title"
      onMouseDown={handleCloseDetails}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#17100c] shadow-[0_35px_120px_rgba(0,0,0,0.7)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleCloseDetails}
          aria-label="Close details"
          className="absolute cursor-pointer right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:rotate-90 hover:border-[#d98745]/50 hover:bg-[#d98745]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[90vh] w-full overflow-y-auto lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
          {/* Fixed image area */}
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[400px] lg:min-h-[650px]">
            {selectedChoice.image && (
              <img
                src={selectedChoice.image}
                alt={selectedChoice.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#17100c] via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:to-[#17100c]/25" />

            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#e59a61]" />
                {selectedChoice.category}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 lg:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#e59a61]">
                {selectedChoice.price}
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                {selectedChoice.name}
              </h3>
            </div>
          </div>

          {/* Scrollable details */}
          <div className="overflow-y-auto px-6 py-8 sm:px-9 sm:py-10 lg:max-h-[90vh] lg:px-12 lg:py-14">
            <div className="hidden lg:block">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d8894d]">
                <Coffee className="h-4 w-4" />
                Breakfast favourite
              </span>

              <h3
                id="breakfast-modal-title"
                className="mt-4 pr-12 text-4xl font-black tracking-[-0.04em] text-white"
              >
                {selectedChoice.name}
              </h3>

              <p className="mt-3 text-xl font-black text-[#e59a61]">
                {selectedChoice.price}
              </p>
            </div>

            <p className="mt-6 text-sm leading-7 text-[#c6b4a7] sm:text-base">
              {selectedChoice.fullDescription}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d98745]/15 text-[#e59a61]">
                  <Clock3 className="h-5 w-5" />
                </div>

                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#9f8b7c]">
                  Preparation
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {selectedChoice.preparationTime}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d98745]/15 text-[#e59a61]">
                  <Users className="h-5 w-5" />
                </div>

                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#9f8b7c]">
                  Serving
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {selectedChoice.serving}
                </p>
              </div>
            </div>

            <div className="mt-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8894d]">
                What is included
              </p>

              <div className="mt-4 space-y-3">
                {selectedChoice.includes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d98745]/15 text-[#e59a61]">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>

                    <p className="text-sm text-[#d5c5b9]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 rounded-2xl border border-[#d98745]/20 bg-[#d98745]/[0.08] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d98745]/15 text-[#e59a61]">
                  <Coffee className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Perfect with fresh coffee
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#bda99b]">
                    Pair this breakfast with an espresso, cappuccino or iced
                    coffee for a complete cafe experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )}

      {isFullMenuOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] overflow-y-auto bg-[#120b08] text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="full-menu-title"
          >
            <div className="relative min-h-screen overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(207,119,61,0.18),transparent_28%),radial-gradient(circle_at_90%_35%,rgba(126,69,37,0.14),transparent_30%)]" />

              <div className="relative mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
                <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-7 sm:pb-9">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#db8a4d]">
                      <Coffee className="h-4 w-4" />
                      KVK Cafe
                    </div>

                    <h2
                      id="full-menu-title"
                      className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.04em] text-[#fff8f0] sm:text-5xl lg:text-6xl"
                    >
                      The full menu
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#bda99b] sm:text-base">
                      Freshly prepared favourites, rich coffee and small
                      moments worth slowing down for.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseFullMenu}
                    aria-label="Close full menu"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:rotate-90 hover:border-[#d98745]/60 hover:bg-[#d98745]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {menuItems.length > 0 ? (
                  <div className="grid gap-5 py-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
                    {menuItems.map((item) => (
                      <article
                        key={item.id}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[#d98745]/40"
                      >
                        <div className="relative h-56 overflow-hidden bg-[#25150d] sm:h-64">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(211,134,67,0.2),transparent_60%)] text-[#d98745]">
                              <Coffee className="h-14 w-14 opacity-70" />
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#18100b] to-transparent" />
                          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f0b178] backdrop-blur-md">
                            {item.category}
                          </span>
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-black text-white sm:text-2xl">
                              {item.name}
                            </h3>
                            <p className="shrink-0 text-sm font-bold text-[#e59a61]">
                              {item.price}
                            </p>
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#bda99b]">
                            {item.description}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              handleCloseFullMenu();
                              handleOpenDetails(item);
                            }}
                            className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-white transition hover:text-[#e59a61]"
                          >
                            View details
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[45vh] items-center justify-center py-12 text-center">
                    <div>
                      <Coffee className="mx-auto h-12 w-12 text-[#d98745]" />
                      <h3 className="mt-5 text-2xl font-black text-white">
                        Menu is being prepared
                      </h3>
                      <p className="mt-2 text-sm text-[#bda99b]">
                        Please check back in a moment for today&apos;s menu.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
