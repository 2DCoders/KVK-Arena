import Girl from "@/assets/coffee-girl.png";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Coffee,
  Croissant,
  Flame,
  Quote,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const popularChoices = [
  {
    id: 1,
    name: "Classic Breakfast",
    description: "Eggs, sausages, toast, roasted tomatoes and fresh coffee.",
    price: "LKR 1,850",
    category: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Butter Croissant",
    description: "Freshly baked croissant served with butter and fruit preserve.",
    price: "LKR 750",
    category: "Freshly Baked",
    image:
      "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Avocado Toast",
    description: "Sourdough toast, smashed avocado, poached egg and herbs.",
    price: "LKR 1,450",
    category: "Healthy Choice",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Pancake Stack",
    description: "Soft pancakes with berries, maple syrup and whipped cream.",
    price: "LKR 1,350",
    category: "Sweet Morning",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Breakfast Bagel",
    description: "Toasted bagel with egg, cheese, greens and creamy dressing.",
    price: "LKR 1,250",
    category: "Quick Bite",
    image:
      "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "French Toast",
    description: "Golden brioche, cinnamon, caramelised banana and honey.",
    price: "LKR 1,400",
    category: "Cafe Favourite",
    image:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=85",
  },
];

export default function CafeJourney() {
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = horizontalSectionRef.current;
    const track = horizontalTrackRef.current;

    if (!section || !track) return;

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
      className="relative overflow-hidden bg-[#120c08] text-white"
    >
      {/* Hero area */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(181,108,56,0.2),transparent_34%),radial-gradient(circle_at_10%_10%,rgba(121,65,34,0.13),transparent_25%)]" />

        <div className="pointer-events-none absolute -left-40 top-28 h-[480px] w-[480px] rounded-full border border-[#d79a63]/10" />

        <div className="pointer-events-none absolute -right-32 bottom-10 h-[520px] w-[520px] rounded-full border border-[#d79a63]/10" />

        <div className="pointer-events-none absolute left-[48%] top-24 hidden h-24 w-24 rounded-full bg-[#d38443]/10 blur-2xl lg:block" />

        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20">
          {/* Left content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a96a3b]/30 bg-[#21140d]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e4ad7a] backdrop-blur-md">
              <Coffee className="h-4 w-4" />
              Breakfast and coffee
            </div>

            <h2 className="mt-7 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-[#fff8f0] sm:text-5xl lg:text-6xl xl:text-7xl">
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

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                className="group inline-flex h-13 items-center justify-center gap-3 rounded-2xl bg-[#c9783d] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(181,95,42,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#dc8b4d]"
              >
                Explore breakfast
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                  ].map((avatar) => (
                    <img
                      key={avatar}
                      src={avatar}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-[#120c08] object-cover"
                    />
                  ))}
                </div>

                <div>
                  <p className="text-sm font-bold text-[#fff8f0]">
                    300+ happy guests
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-xs text-[#bca99b]">
                    <Star className="h-3.5 w-3.5 fill-[#f0a548] text-[#f0a548]" />
                    <span className="font-semibold text-[#f4d3b4]">4.9</span>
                    <span>customer rating</span>
                  </div>
                </div>
              </div>
            </div>

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
          <div className="relative mx-auto flex min-h-[560px] w-full max-w-[620px] items-center justify-center">
            <div className="absolute h-[500px] w-[500px] rounded-full border border-[#d18a50]/25" />

            <div className="absolute h-[430px] w-[430px] rounded-full bg-gradient-to-br from-[#d68643] via-[#9b5129] to-[#4e2515] shadow-[0_40px_100px_rgba(0,0,0,0.45)]" />

            <div className="absolute h-[350px] w-[350px] rounded-full border border-white/10" />

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
        className="relative min-h-screen overflow-hidden border-t border-white/10 bg-[#0d0906]"
      >
        <div className="flex h-screen flex-col justify-center">
          {/* Title */}
          <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between px-5 sm:px-8 lg:px-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d8894d]">
                <Flame className="h-4 w-4" />
                Customer favourites
              </div>

              <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
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
            className="flex w-max gap-6 pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] pr-[10vw]"
          >
            {popularChoices.map((item, index) => (
              <article
                key={item.id}
                className="group relative h-[430px] w-[310px] shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#18100b] shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:w-[360px] lg:h-[470px] lg:w-[390px]"
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
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-[#e59a61]"
                  >
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}

            {/* Ending card */}
            <div className="flex h-[430px] w-[300px] shrink-0 items-center justify-center rounded-[2rem] border border-dashed border-[#bc7442]/35 bg-[#18100b]/70 p-8 text-center lg:h-[470px]">
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
          <div className="mx-auto mt-10 w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="h-px w-full bg-white/10">
              <div className="h-px w-1/3 bg-gradient-to-r from-[#d17f43] to-[#f0b178]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}