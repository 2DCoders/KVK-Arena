import { useEffect, useRef, useState } from "react"

import { Dumbbell, Truck, Gamepad, SportShoe, Coffee } from "lucide-react"
import bg from "@/assets/flow1.png"

const features = [
    {
        id: 1,
        title: "Gym",
        subtitle: "Strength & Cardio",
        desc: "Modern training space with free weights, machines and classes.",
        icon: Dumbbell,
        color: "from-indigo-500 to-violet-500",
        glow: "shadow-[0_0_40px_rgba(99,102,241,0.45)]",
        dot: "bg-indigo-400",
        text: "text-indigo-300",
    },
    {
        id: 2,
        title: "Car Wash",
        subtitle: "Wash & Shine",
        desc: "Professional vehicle cleaning, detailing and quick services.",
        icon: Truck,
        color: "from-cyan-400 to-blue-600",
        glow: "shadow-[0_0_40px_rgba(34,211,238,0.45)]",
        dot: "bg-cyan-300",
        text: "text-cyan-300",
    },
    {
        id: 3,
        title: "Gaming Centre",
        subtitle: "Play & Compete",
        desc: "High-performance rigs and comfortable setups for gamers.",
        icon: Gamepad,
        color: "from-emerald-400 to-teal-600",
        glow: "shadow-[0_0_40px_rgba(16,185,129,0.45)]",
        dot: "bg-emerald-300",
        text: "text-emerald-300",
    },
    {
        id: 4,
        title: "Badminton Court",
        subtitle: "Indoor Courts",
        desc: "Book courts for training or friendly matches with ease.",
        icon: SportShoe,
        color: "from-yellow-400 to-orange-500",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.45)]",
        dot: "bg-yellow-300",
        text: "text-yellow-300",
    },
    {
        id: 5,
        title: "Cafe",
        subtitle: "Coffee & Snacks",
        desc: "Relax with fresh coffee, snacks, and a comfortable lounge atmosphere.",
        icon: Coffee,
        color: "from-pink-500 to-rose-600",
        glow: "shadow-[0_0_40px_rgba(244,114,182,0.45)]",
        dot: "bg-pink-300",
        text: "text-pink-300",
    },
]

export default function WorkFlow() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const section = sectionRef.current

        if (!section) {
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting)
            },
            { threshold: 0.22 }
        )

        observer.observe(section)

        return () => observer.disconnect()
    }, [])

    return (
        <>
            <section ref={sectionRef} className="relative overflow-hidden py-20 lg:py-28">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                    style={{ backgroundImage: `url(${bg})` }}
                />
                <div aria-hidden="true" className="absolute inset-0 bg-black/48" />
                {/* Background Glow */}

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 data-aos="fade-up" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                            Every Step of the Journey
                        </h2>

                        <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-base text-slate-300">
                            A seamless timeline showcasing core experiences at the arena.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative mt-20">

                        {/* Connection Line */}
                        <div className="absolute left-0 right-0 top-10 hidden h-px bg-white/10 lg:block" />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                            {features.map((f, index) => {
                                const Icon = f.icon

                                return (
                                    <div
                                        key={f.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${index * 100}`}
                                        className={`group relative overflow-hidden rounded-[30px] border border-white/10 bg-linear-to-b from-[#081225] to-[#050b18] p-7 text-center transition-all duration-700 hover:-translate-y-2 hover:border-white/20 ${isVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[2px]"}`}
                                    >
                                        {/* Glass Glow */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

                                        {/* Step */}
                                        <div className="relative mb-8 flex items-center justify-center gap-3">
                                            <div className="h-px w-10 bg-white/20" />
                                            <span className={`text-xs font-bold tracking-[0.3em] ${f.text}`}>
                                                0{f.id}
                                            </span>
                                            <div className="h-px w-10 bg-white/20" />
                                        </div>

                                        {/* Icon */}
                                        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">

                                            {/* Outer Ring */}
                                            <div className="absolute inset-0 rounded-full border border-white/10" />

                                            {/* Orbiting Glow Dot */}
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                <div className="relative h-20 w-20">
                                                    <div className="absolute inset-0 animate-orbit">
                                                        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full ${f.dot} blur-[1px] animate-glow`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Icon Box */}
                                            <div
                                                className={`relative flex h-12 w-12 items-center justify-center rounded-3xl bg-linear-to-br ${f.color} text-4xl text-white ${f.glow} transition-transform duration-500 group-hover:scale-110`}
                                            >
                                                <Icon size={28} className="text-white" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="mt-4 text-2xl font-bold leading-tight text-white">
                                            {f.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-200 italic font-semibold">
                                            {f.subtitle}
                                        </p>

                                        <p className="mt-3 text-sm leading-6 text-slate-200/90">
                                            {f.desc}
                                        </p>

                                        {/* Big Number */}
                                        <span className="pointer-events-none absolute bottom-0 right-4 text-[110px] font-black leading-none text-white/3">
                                            0{f.id}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <style>{`
                            @keyframes glowPulse {
                                0% { transform: scale(1); opacity: 1; filter: blur(1px); }
                                50% { transform: scale(1.6); opacity: 0.55; filter: blur(6px); }
                                100% { transform: scale(1); opacity: 1; filter: blur(1px); }
                            }

                            .animate-glow {
                                animation: glowPulse 2.4s ease-in-out infinite;
                            }

                            @keyframes orbit {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }

                            .animate-orbit {
                                transform-origin: center center;
                                animation: orbit 6s linear infinite;
                            }

                            @media (prefers-reduced-motion: reduce) {
                                .animate-glow,
                                .animate-orbit {
                                    animation: none;
                                }
                            }
                        `}</style>
        </>
    )
}