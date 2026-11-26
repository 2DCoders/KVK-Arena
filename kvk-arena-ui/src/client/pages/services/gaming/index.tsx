import { ArrowRight } from "lucide-react";
import ps5Image from "@/assets/gaming/ps5-lounge.png";
import movieRoomImage from "@/assets/gaming/private-cinema.png";
import poolImage from "@/assets/gaming/pool-tables.png";

const secondaryServices = [
  {
    title: "Pool Tables",
    description: "Rack up, break, and enjoy some friendly competition.",
    image: poolImage,
    comingSoon: true,
  },
  {
    title: "Private Movie Rooms",
    description: "Enjoy a big-screen experience in a room just for your group.",
    image: movieRoomImage,
    href: "#movies",
  },
];

export default function GamingServices() {
  return (
    <section aria-labelledby="gaming-services-heading" className="bg-[#faf8f6] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-12" data-aos="fade-up">
          <h2 id="gaming-services-heading" className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            What We Offer
          </h2>
          <div aria-hidden="true" className="mx-auto mt-4 h-1 w-12 rounded-full bg-red-700" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-5" data-aos="fade-up">
          <article className="relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl bg-[#251719] shadow-sm sm:min-h-100 lg:row-span-2">
            <img src={ps5Image} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover object-right" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/45 to-black/5" />
            <div className="p-6 text-white sm:p-8 lg:p-10">
              <h3 className="text-3xl font-black tracking-tight sm:text-4xl">PS5 Gaming</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/90 sm:text-base">
                Play your favorite titles on PlayStation 5.
              </p>
              <a href="#games" className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Explore PS5 <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>

          {secondaryServices.map(({ title, description, image, comingSoon, href }) => (
            <article key={title} className="grid min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm sm:grid-cols-[1fr_0.9fr]">
              <div className="flex flex-col items-start justify-center p-5 sm:p-6">
                <span aria-hidden="true" className="mb-3 h-1 w-6 rounded-full bg-red-700" />
                <h3 className="text-xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                {comingSoon && (
                  <span className="mt-3 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-800">Coming Soon</span>
                )}
                {href && (
                  <a href={href} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-red-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
                    Explore movies <ArrowRight size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
              <div className="relative min-h-36 overflow-hidden bg-stone-900 sm:min-h-48">
                <img src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
