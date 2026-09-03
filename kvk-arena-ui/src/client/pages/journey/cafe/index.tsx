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

gsap.registerPlugin(ScrollTrigger);

const popularChoices = [
  {
    id: 1,
    name: "Classic Breakfast",
    description: "Eggs, sausages, toast, roasted tomatoes and fresh coffee.",
    fullDescription:
      "A complete breakfast prepared for a satisfying start to your morning. It includes freshly cooked eggs, grilled sausages, toasted bread, roasted tomatoes and a carefully brewed cup of coffee.",
    price: "LKR 1,850",
    category: "Best Seller",
    preparationTime: "15–20 min",
    serving: "1 person",
    includes: [
      "Two freshly cooked eggs",
      "Grilled breakfast sausages",
      "Buttered toast",
      "Roasted tomatoes",
      "Freshly brewed coffee",
    ],
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Butter Croissant",
    description:
      "Freshly baked croissant served with butter and fruit preserve.",
    fullDescription:
      "A light and flaky butter croissant baked until golden, then served warm with creamy butter and a seasonal fruit preserve.",
    price: "LKR 750",
    category: "Freshly Baked",
    preparationTime: "5–10 min",
    serving: "1 person",
    includes: [
      "Fresh butter croissant",
      "Creamy butter",
      "Seasonal fruit preserve",
      "Optional coffee pairing",
    ],
    image:
      "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Avocado Toast",
    description: "Sourdough toast, smashed avocado, poached egg and herbs.",
    fullDescription:
      "Toasted sourdough topped with seasoned avocado, a soft poached egg and fresh herbs for a balanced and refreshing breakfast.",
    price: "LKR 1,450",
    category: "Healthy Choice",
    preparationTime: "10–15 min",
    serving: "1 person",
    includes: [
      "Toasted sourdough",
      "Seasoned avocado",
      "Poached egg",
      "Fresh herbs",
      "Light seasoning",
    ],
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Pancake Stack",
    description: "Soft pancakes with berries, maple syrup and whipped cream.",
    fullDescription:
      "A warm stack of soft pancakes layered with maple syrup and finished with fresh berries and whipped cream.",
    price: "LKR 1,350",
    category: "Sweet Morning",
    preparationTime: "15 min",
    serving: "1 person",
    includes: [
      "Three soft pancakes",
      "Fresh berries",
      "Maple syrup",
      "Whipped cream",
    ],
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Breakfast Bagel",
    description: "Toasted bagel with egg, cheese, greens and creamy dressing.",
    fullDescription:
      "A toasted bagel filled with egg, melted cheese, crisp greens and a smooth house dressing.",
    price: "LKR 1,250",
    category: "Quick Bite",
    preparationTime: "10–15 min",
    serving: "1 person",
    includes: [
      "Toasted bagel",
      "Cooked egg",
      "Melted cheese",
      "Fresh greens",
      "House dressing",
    ],
    image:
      "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "French Toast",
    description: "Golden brioche, cinnamon, caramelised banana and honey.",
    fullDescription:
      "Golden brioche French toast flavoured with cinnamon and topped with caramelised banana and a gentle drizzle of honey.",
    price: "LKR 1,400",
    category: "Cafe Favourite",
    preparationTime: "15–20 min",
    serving: "1 person",
    includes: [
      "Golden brioche toast",
      "Cinnamon",
      "Caramelised banana",
      "Honey drizzle",
    ],
    image:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=85",
  },
];

type PopularChoice = (typeof popularChoices)[number];

export default function CafeJourney() {
  const [selectedChoice, setSelectedChoice] = useState<PopularChoice | null>(
    null,
  );

  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const handleOpenDetails = (item: PopularChoice) => {
    setSelectedChoice(item);
  };

  const handleCloseDetails = () => {
    setSelectedChoice(null);
  };

  useEffect(() => {
  if (!selectedChoice) return;

  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSelectedChoice(null);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedChoice]);

  useEffect(() => {
    const section = horizontalSectionRef.current;
    const track = horizontalTrackRef.current;

    if (!section || !track || !window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const gsapContext = gsap.context(() => {
      const getScrollDistance = () => {
        return Math.max(0, track.scrollWidth - window.innerWidth);
      };

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance() + window.innerHeight * 0.8}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      gsapContext.revert();
    };
  }, []);

  return (
    <section
      id="breakfast"
      className="relative overflow-hidden bg-[#21130c] text-white"
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
          <div className="relative mx-auto flex min-h-[390px] w-full max-w-[620px] items-center justify-center sm:min-h-[560px]">
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
            <div className="absolute bottom-12 right-10 z-20 hidden w-[230px] rounded-2xl border border-white/10 bg-[#1e130d]/90 p-3 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl md:block">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl">
                  <img
                    src={popularChoices[0].image}
                    alt={popularChoices[0].name}
                    className="h-full w-full object-cover"
                  />
                </div>

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

            <div className="absolute bottom-4 left-16 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-[#d98a4c]/20 bg-[#d98a4c]/10 text-[#eaa56d] backdrop-blur-md">
              <Coffee className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal choices section */}
      <div
        ref={horizontalSectionRef}
        className="relative overflow-hidden border-t border-white/10 bg-[#21130c] md:min-h-screen"
      >
        <div className="flex flex-col justify-center py-16 md:h-screen md:py-0">
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
            className="flex w-full flex-col gap-5 px-5 sm:gap-6 sm:pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] sm:pr-[10vw] md:w-max md:flex-row md:px-0"
          >
            {popularChoices.map((item, index) => (
              <article
                key={item.id}
                className="group relative h-[390px] w-full shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#18100b] shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:w-[360px] sm:h-[430px] md:w-[360px] lg:h-[470px] lg:w-[390px]"
              >
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

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
            <div className="flex h-[300px] w-full shrink-0 items-center justify-center rounded-[2rem] border border-dashed border-[#bc7442]/35 bg-[#18100b]/70 p-8 text-center sm:w-[300px] sm:h-[430px] lg:h-[470px]">
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9783d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#dd8b4c]"
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
            <img
              src={selectedChoice.image}
              alt={selectedChoice.name}
              className="absolute inset-0 h-full w-full object-cover"
            />

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
    </section>
  );
}
