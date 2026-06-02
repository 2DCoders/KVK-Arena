import { useState } from "react"
import { ChevronDown } from "lucide-react"

type FaqItem = {
    question: string
    answer: string
}

const faqItems: FaqItem[] = [
    {
        question: "Do I need prior fitness experience to join?",
        answer:
            "Not at all. Our programs are designed for every level, from complete beginners to advanced athletes. Our coaches tailor everything to your pace.",
    },
    {
        question: "How does the membership work?",
        answer:
            "Choose the plan that fits your goals, visit the arena during supported hours, and enjoy access to the facilities and coaching options included in your membership.",
    },
    {
        question: "Do you offer personal training?",
        answer:
            "Yes. One-on-one coaching is available for members who want a structured plan, progress tracking, and direct support from a coach.",
    },
    {
        question: "Can I pause or cancel my membership?",
        answer:
            "Yes, membership support is flexible. If your schedule changes, our team can help you review pause or cancellation options based on your plan.",
    },
    {
        question: "Are group classes included in the membership?",
        answer:
            "Group class access depends on the membership type you choose. Some plans include classes by default, while others offer them as an add-on.",
    },
    {
        question: "Do you offer nutrition guidance?",
        answer:
            "Yes. We can connect you with guidance that supports your training goals, whether you want general advice or a more structured plan.",
    },
    {
        question: "What should I bring for my first session?",
        answer:
            "Bring comfortable sportswear, a water bottle, and any personal items you need. If you have a plan or goals in mind, that helps us tailor the session.",
    },
    {
        question: "Do you have online coaching options?",
        answer:
            "Online coaching is available for members who need more flexible support. It is a good option if you want guidance between in-person visits.",
    },
]

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 py-16 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,134,252,0.16),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(207,239,255,0.08),_transparent_35%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">

                    <h2
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent"
                    >
                        Frequently Asked Questions
                    </h2>

                    <p data-aos="fade-up" data-aos-delay="150" className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                        Everything you need to know about memberships, coaching, and what to expect when you train at KVK Arena.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    <aside data-aos="fade-right" data-aos-delay="200" className="rounded-3xl border border-white/8 bg-white/6 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FC0FF]">
                            Support Snapshot
                        </p>

                        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            Fast help for memberships, coaching, and bookings.
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                            We keep the process simple: choose a plan, check the answers below, and reach out when you need a personal follow-up.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                    Best for
                                </p>
                                <p className="mt-2 text-lg font-bold tracking-tight text-white">
                                    New members, parents, and athletes
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Most questions are about membership options, access rules, and first-session preparation.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                        Support hours
                                    </p>
                                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                                        Mon - Sun
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                        Support style
                                    </p>
                                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                                        Friendly and direct
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#296BE1]/30 bg-[#000000] p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#296BE1]">
                                    Need personal help?
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Contact the team directly if your question is about a special membership plan or coaching package.
                                </p>
                            </div>
                        </div>
                    </aside>

                    <div data-aos="fade-left" data-aos-delay="200" className="space-y-3">
                        {faqItems.map((item, index) => {
                            const isOpen = index === openIndex

                            return (
                                <div
                                    key={item.question}
                                    className={`rounded-2xl border transition-all duration-300 ${isOpen
                                        ? "border-[#296BE1] bg-[#000000]"
                                        : "border-white/8 bg-white/6"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                                    >
                                        <span
                                            className={`text-sm font-medium sm:text-base ${isOpen ? "text-[#296BE1]" : "text-slate-100"
                                                }`}
                                        >
                                            {item.question}
                                        </span>

                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isOpen
                                            ? "border-[#296BE1]/40 bg-[#000000] text-[#296BE1]"
                                            : "border-white/10 bg-white/5 text-slate-300"
                                            }`}>
                                            <ChevronDown
                                                size={18}
                                                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                            />
                                        </span>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <div className="border-t border-[#8b6b1f]/35 px-5 py-4 sm:px-6">
                                            <p className="text-sm leading-7 text-slate-300 sm:text-base">
                                                {item.answer}
                                            </p>
                                        </div>
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