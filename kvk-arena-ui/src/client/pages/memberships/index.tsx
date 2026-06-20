import SignupModal from "@/components/signup/gym";
import { getMembershipPlans } from "@/services/memberships-api";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Memberships() {
  const [plans, setPlans] = useState<any[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [isOpenSignup, setIsOpenSignup] = useState(false);

  const fetchMembershipPlans = async () => {
    try {
      const res = await getMembershipPlans();
      setPlans(res.additionalData.response);
    } catch (error) {
      console.error("Error fetching membership plans:", error);
    }
  };

  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const scrollRail = (direction: "left" | "right") => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const distance = rail.clientWidth * 0.82;
    rail.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 pt-15 md:pt-25 pb-10">
      <SignupModal open={isOpenSignup} onClose={() => setIsOpenSignup(false)} />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center pb-10 md:pb-0">
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            <h2
              data-aos="fade-up"
              className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent"
            >
              Flexible Membership Plans
            </h2>
          </h2>

          <p
            data-aos="fade-up"
            data-aos-delay="150"
            className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:text-lg"
          >
            Focused support designed to help you train better, move smarter, and
            reach your goals with confidence.
          </p>
        </div>

        <div className="mt-5 hidden md:flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => scrollRail("left")}
            aria-label="Scroll membership plans left"
            className="flex cursor-pointer h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollRail("right")}
            aria-label="Scroll membership plans right"
            className="flex cursor-pointer h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#296BE1] text-white shadow-[0_12px_30px_rgba(41,107,225,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1f58be]"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          ref={railRef}
          data-aos="fade-up"
          className="
            mt-5
            flex
            gap-4
            sm:gap-6
            overflow-x-auto
            scroll-smooth
            pb-6
            px-1
            snap-x
            snap-mandatory
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {plans
            .filter((plan) => plan.isActive === 1)
            .map((plan) => (
              <article
                key={plan.id}
                className={`group relative snap-center min-w-[280px] basis-[280px] sm:min-w-[320px] sm:basis-[320px] lg:min-w-[360px] lg:basis-[360px]  overflow-hidden rounded-2xl border p-6 shadow-[0_18px_50px_rgba(0,0,0,0.2)] transform-gpu transition duration-300 ease-out hover:z-20 hover:[transform:perspective(1200px)_translateY(-12px)_rotateX(7deg)_rotateY(-7deg)_scale(1.03)] hover:shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:min-w-[360px] sm:basis-[360px] ${plan.title === "Monthly Plan"
                    ? "border-[#296BE1] bg-[#000000] ring-1 ring-[#e6a79e]/30"
                    : "border-white/6 bg-white/6"
                  }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {plan.title === "Monthly Plan" && (
                  <div className="absolute right-3 top-3 rounded-full border border-[#296BE1]/40 bg-[#e6a79e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#296BE1]">
                    Recommended
                  </div>
                )}

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-white sm:text-2xl">
                    LKR{" "}
                    {Number(plan.price).toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="pb-1 text-xs text-slate-400">
                    /
                    {plan.durationInDays === 1
                      ? "1 D"
                      : plan.durationInDays === 30
                        ? "1 M"
                        : plan.durationInDays === 90
                          ? "3 M"
                          : plan.durationInDays === 365
                            ? "1 Y"
                            : `${plan.durationInDays} days`}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {plan.title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                  {plan.description}
                </p>

                <button
                  type="button"
                  className={`mt-6 inline-flex cursor-pointer w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${plan.featured
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  onClick={() => setIsOpenSignup(true)}
                >
                  Book a Membership
                </button>

                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    What&apos;s included:
                  </p>

                  <ul className="mt-4 space-y-3">
                    {plan.features.split(",").map((feature: string) => (
                      <li
                        key={feature.trim()}
                        className="flex items-start gap-3 text-sm text-slate-200"
                      >
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-slate-100">
                          <Check size={12} strokeWidth={2.5} />
                        </span>
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
