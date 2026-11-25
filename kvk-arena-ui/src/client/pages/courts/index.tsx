import { ArrowUpRight } from "lucide-react";
import { Target, UserRound, UsersRound } from "lucide-react";

const formats = [
  { label: "Singles", detail: "Play one-on-one", icon: UserRound },
  { label: "Doubles", detail: "Bring three friends", icon: UsersRound },
  { label: "Coaching", detail: "Train with your own coach", icon: Target },
];

export default function Courts() {
  return (
    <section
      aria-labelledby="badminton-courts-heading"
      className="bg-[#100e0d] px-4 py-12 text-white sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-[#45332a] bg-[#191410] shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col items-start justify-center bg-[radial-gradient(ellipse_at_top_left,#352318,transparent_75%)] px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4b986]">
            Badminton at KVK Arena
          </p>
          <h2 id="badminton-courts-heading" className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            Make time for
            <span className="block text-[#f4b986]">your next match.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-300 sm:text-base">
            Find an open time on one of our two indoor badminton courts.
          </p>
          <a
            href="#bookings"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-between gap-5 rounded-xl bg-[#f4b986] px-5 py-3 text-sm font-bold text-[#21140d] transition-colors hover:bg-[#ffdbb8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4b986] sm:w-fit"
          >
            Check court availability
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>

        <div className="relative isolate flex items-center overflow-hidden border-t border-[#45332a] bg-[#211915] p-5 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-80 w-56 -translate-y-1/2 rotate-[24deg] border-2 border-[#f4b986]/20 shadow-[0_0_80px_rgba(244,185,134,0.10)]">
            <div className="absolute inset-x-5 inset-y-0 border-x border-[#f4b986]/20" />
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-[#f4b986]/25" />
            <div className="absolute inset-x-5 inset-y-[24%] border-y border-[#f4b986]/20" />
          </div>
          <ul className="grid w-full gap-2.5">
            {formats.map(({ label, detail, icon: Icon }) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl border border-[#f4b986]/15 bg-[#15110f]/90 p-3 sm:gap-4 sm:p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4b986]/10 text-[#f4b986]">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-stone-100">{label}</p>
                  <p className="text-sm text-stone-300">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
