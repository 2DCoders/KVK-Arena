import { useEffect, useState } from "react"
import { ClipboardList, Dumbbell, MoonStar, Target } from "lucide-react"

const steps = [
    {
        title: "Assessment",
        description: "Tell us your current fitness level and training goals.",
        icon: ClipboardList,
    },
    {
        title: "Train Hard",
        description: "Follow a focused workout plan built for steady progress.",
        icon: Dumbbell,
    },
    {
        title: "Recover Well",
        description: "Balance effort with rest, sleep, and mobility work.",
        icon: MoonStar,
    },
    {
        title: "Reach Result",
        description: "Track milestones and keep moving toward the next one.",
        icon: Target,
    },
]

export default function GymStepper() {
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % steps.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative overflow-hidden bg-[#f5f5f5] py-14 lg:py-20">
            <style>{`
                @keyframes gym-step-fill {
                    from {
                        transform: scaleY(0);
                    }

                    to {
                        transform: scaleY(2);
                    }
                }
            `}</style>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <p data-aos="fade-up" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Come to a result
                    </p>

                    <h2 data-aos="fade-up" data-aos-delay="100" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                        With Us
                    </h2>

                    <p data-aos="fade-up" data-aos-delay="150" className="mt-4 text-base text-slate-500">
                        Ready to take the first step towards a healthier, stronger you?
                    </p>
                </div>

                <div className="relative mt-12">
                    <div className="pointer-events-none absolute left-14 right-14 top-14 hidden border-t border-dashed border-slate-400/70 lg:block" />

                    <div className="grid gap-6 lg:grid-cols-4 lg:gap-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = index === activeIndex

                            return (
                                <div
                                    key={step.title}
                                    data-aos="fade-up"
                                    data-aos-delay={`${index * 100}`}
                                    className="relative z-10 flex flex-col items-center text-center"
                                >
                                    <div
                                        className={`relative z-10 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-300 ${isActive
                                            ? " text-white shadow-[0_18px_45px_rgba(17,17,17,0.18)]"
                                            : "border-slate-300 bg-white text-slate-900"
                                            }`}
                                    >
                                        {isActive && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-0 origin-left bg-linear-to-r from-[#0f3c91] via-[#296BE1] to-[#8fc0ff]"
                                                style={{ animation: "gym-step-fill 2s linear forwards" }}
                                            />
                                        )}

                                        <Icon
                                            size={38}
                                            strokeWidth={1.8}
                                            className="relative z-10"
                                        />
                                    </div>

                                    <div className="mt-6 max-w-[18rem] px-3">
                                        <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}