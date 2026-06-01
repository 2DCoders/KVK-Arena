import { useMemo, useRef } from "react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

type Plan = {
    name: string
    subtitle: string
    price: string
    period: string
    description: string
    features: string[]
    footnote: string
    featured?: boolean
}

const plans: Plan[] = [
    {
        name: "Basic Membership",
        subtitle: "DAY PASS",
        price: "$29.49",
        period: "/ Per month",
        description:
            "Ideal for travelers, busy professionals, or anyone trying the gym for the first time.",
        features: [
            "Single-day access",
            "Facility limited access",
            "One day",
            "Coach available as add-on",
        ],
        footnote: "Travelers and first-time visitors",
    },
    {
        name: "Pro Membership",
        subtitle: "PERSONAL TRAINING",
        price: "$249.99",
        period: "/ Per month",
        description:
            "One-on-one coaching tailored around you with structured progress and weekly accountability.",
        features: [
            "Full access",
            "Classes optional add-on",
            "1:1 dedicated coach",
            "Custom workout plans",
            "Weekly check-ins",
            "Locker rooms, showers",
            "Program-based",
        ],
        footnote: "Members focused on serious progress",
        featured: true,
    },
    {
        name: "Elite Membership",
        subtitle: "UNLIMITED CLASSES",
        price: "$149.99",
        period: "/ Per month",
        description:
            "Join as many group sessions as you want with unlimited access to classes and community energy.",
        features: [
            "Full access",
            "Unlimited",
            "Coach available as add-on",
            "Class-based tracking",
            "Locker rooms, showers",
            "Month-to-month",
        ],
        footnote: "People who love group energy and structure",
    },
    {
        name: "Family Membership",
        subtitle: "SHARED FITNESS",
        price: "$189.99",
        period: "/ Per month",
        description:
            "A flexible package for families who want to train together and save with shared access.",
        features: [
            "Up to 4 family members",
            "Shared gym access",
            "Kids activity add-on",
            "Family progress support",
            "Locker rooms, showers",
            "Flexible billing",
        ],
        footnote: "Great for households training together",
    },
]

export default function Memberships() {
    const railRef = useRef<HTMLDivElement | null>(null)

    const stats = useMemo(
        () => [
            { label: "Plans", value: `${plans.length}+` },
            { label: "Support", value: "Weekly" },
            { label: "Access", value: "Flexible" },
        ],
        [],
    )

    const scrollRail = (direction: "left" | "right") => {
        const rail = railRef.current

        if (!rail) {
            return
        }

        const distance = rail.clientWidth * 0.82
        rail.scrollBy({
            left: direction === "left" ? -distance : distance,
            behavior: "smooth",
        })
    }

    return (
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 py-5 lg:py-15">
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">

                    <h2 data-aos="fade-up" data-aos-delay="100" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl">
                        <h2 data-aos="fade-up" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                            Flexible Membership Plans
                        </h2>
                    </h2>

                    <p data-aos="fade-up" data-aos-delay="150" className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                        Focused support designed to help you train better, move smarter,
                        and reach your goals with confidence.
                    </p>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
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
                    className="mt-5 py-5 flex gap-6 overflow-x-auto scroll-smooth pb-6 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={`group relative min-w-[320px] flex-1 basis-[320px] overflow-hidden rounded-2xl border p-6 shadow-[0_18px_50px_rgba(0,0,0,0.2)] transform-gpu transition duration-300 ease-out hover:z-20 hover:[transform:perspective(1200px)_translateY(-12px)_rotateX(7deg)_rotateY(-7deg)_scale(1.03)] hover:shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:min-w-[360px] sm:basis-[360px] ${plan.featured
                                    ? "border-[#e6a79e] bg-[#1d1010] ring-1 ring-[#e6a79e]/30"
                                    : "border-white/6 bg-white/6"
                                }`}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            {plan.featured && (
                                <div className="absolute right-6 top-6 rounded-full border border-[#e6a79e]/40 bg-[#e6a79e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f2c0b8]">
                                    Recommended
                                </div>
                            )}

                            <div className="mt-4 flex items-end gap-2">
                                <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    {plan.price}
                                </span>
                                <span className="pb-1 text-sm text-slate-400">{plan.period}</span>
                            </div>

                            <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                                {plan.subtitle}
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
                            >
                                Book a Membership
                            </button>

                            <div className="mt-6">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                    What&apos;s included:
                                </p>

                                <ul className="mt-4 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                                            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-slate-100">
                                                <Check size={12} strokeWidth={2.5} />
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="mt-5 text-xs leading-5 text-slate-500">
                                {plan.footnote}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}