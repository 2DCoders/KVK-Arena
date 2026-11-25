import { ArrowUpRight, Sparkles } from "lucide-react";
import detailingPhoto from "@/assets/gallery/carwash-g.jpg";

export default function CarwashPackagesPreview() {
  return (
    <section id="packages" aria-labelledby="carwash-packages-title" className="bg-slate-50 px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-800 bg-[#081322] shadow-[0_24px_64px_rgba(8,19,34,0.24)] md:grid-cols-2">
        <div className="bg-[radial-gradient(ellipse_at_top_left,#17345a,transparent_72%)] px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16 lg:py-18">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
            <Sparkles aria-hidden="true" className="size-4" />
            Coming soon
          </p>
          <h2 id="carwash-packages-title" className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl">
            New car wash <span className="text-sky-300">packages</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-300 sm:text-lg">
            A whole new range of car wash and detailing packages is on the way.
          </p>
          <a
            href="#services"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            Explore current services
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto">
          <img
            src={detailingPhoto}
            alt=""
            loading="lazy"
            decoding="async"
            width={1000}
            height={600}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#081322]/35 to-transparent md:bg-gradient-to-r" />
        </div>
      </div>
    </section>
  );
}
