import { useRef } from "react";
import { ArrowRight, Maximize2, X } from "lucide-react";

import courtPhoto from "@/assets/court.png";

const courts = [
  {
    title: "Court 01",
    description: "Professional badminton court with premium flooring and tournament-grade lighting.",
    imagePosition: "object-[40%_center]",
  },
  {
    title: "Court 02",
    description: "Tournament-standard court designed for professional training and competitive matches.",
    imagePosition: "object-[60%_center]",
  },
];

export default function Courts() {
  const photoDialog = useRef<HTMLDialogElement>(null);

  return (
    <section
      aria-labelledby="badminton-courts-heading"
      className="bg-[radial-gradient(ellipse_at_top,#2b1c15_0%,#0d0d0d_58%)] py-14 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 border-b border-white/10 pb-6 sm:mb-10 sm:pb-8" data-aos="fade-up">
          <h2 id="badminton-courts-heading" className="text-3xl font-black tracking-tight sm:text-5xl">
            Badminton <span className="text-[#F6C08C]">courts</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-300 sm:text-base">
            Find an available time for your next match at KVK Arena.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:gap-8" data-aos="fade-up">
          {courts.map((court) => (
            <article
              key={court.title}
              className="group relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl border border-white/15 bg-[#191511] shadow-xl transition-colors hover:border-[#D98B4D]/70 sm:min-h-[390px]"
            >
              <img
                src={courtPhoto}
                alt=""
                loading="lazy"
                className={`absolute inset-0 -z-20 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105 ${court.imagePosition}`}
              />
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/70 to-transparent" />

              <button
                type="button"
                aria-label="Enlarge badminton court photo"
                onClick={() => photoDialog.current?.showModal()}
                className="absolute right-4 top-4 grid size-11 cursor-pointer place-items-center rounded-xl border border-white/25 bg-black/60 text-white backdrop-blur-sm hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-[#F6C08C]"
              >
                <Maximize2 size={18} aria-hidden="true" />
              </button>

              <div className="p-5 sm:p-7">
                <h3 className="text-3xl font-black tracking-tight sm:text-4xl">{court.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-200">{court.description}</p>

                <a
                  href="#bookings"
                  className="mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#F6C08C] px-4 py-2.5 text-sm font-bold text-[#21140D] transition-colors hover:bg-[#ffdab4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F6C08C] sm:w-fit sm:gap-6"
                >
                  Check availability
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <dialog
        ref={photoDialog}
        aria-label="KVK Arena badminton court photo"
        className="fixed inset-0 m-auto max-h-[90vh] max-w-[94vw] overflow-hidden rounded-2xl bg-black p-0 text-white backdrop:bg-black/90"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <img src={courtPhoto} alt="KVK Arena badminton court" loading="lazy" className="max-h-[90vh] max-w-full object-contain" />
        <form method="dialog">
          <button
            type="submit"
            aria-label="Close photo"
            className="absolute right-3 top-3 grid size-11 cursor-pointer place-items-center rounded-xl bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </form>
      </dialog>
    </section>
  );
}
