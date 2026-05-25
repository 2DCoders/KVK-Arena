const features = [
    {
        id: 1,
        title: "Gym",
        subtitle: "Strength & Cardio",
        desc: "Modern training space with free weights, machines and classes.",
        emoji: "🏋️‍♂️",
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
        emoji: "🚗",
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
        emoji: "🎮",
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
        emoji: "🏸",
        color: "from-yellow-400 to-orange-500",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.45)]",
        dot: "bg-yellow-300",
        text: "text-yellow-300",
    },
    {
        id: 5,
        title: "Clothing",
        subtitle: "Merch & Gear",
        desc: "Buy branded apparel and sportswear at the arena store.",
        emoji: "👕",
        color: "from-pink-500 to-rose-600",
        glow: "shadow-[0_0_40px_rgba(244,114,182,0.45)]",
        dot: "bg-pink-300",
        text: "text-pink-300",
    },
]

export default function WorkFlow() {
    return (
        <section className="relative overflow-hidden bg-[#020817] py-20 lg:py-28">
            {/* Background Glow */}
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                        The Journey of a Member
                    </h2>

                    <p className="mt-4 text-base text-slate-300">
                        A seamless timeline showcasing core experiences at the arena.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative mt-20">

                    {/* Connection Line */}
                    <div className="absolute left-0 right-0 top-10 hidden h-[1px] bg-white/10 lg:block" />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">

                        {features.map((f) => (
                            <div
                                key={f.id}
                                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-b from-[#081225] to-[#050b18] p-7 text-center transition-all duration-500 hover:-translate-y-2 hover:border-white/20"
                            >
                                {/* Glass Glow */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

                                {/* Step */}
                                <div className="relative mb-8 flex items-center justify-center gap-3">
                                    <div className="h-[1px] w-10 bg-white/20" />
                                    <span className={`text-xs font-bold tracking-[0.3em] ${f.text}`}>
                                        STEP 0{f.id}
                                    </span>
                                    <div className="h-[1px] w-10 bg-white/20" />
                                </div>

                                {/* Icon */}
                                <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">

                                    {/* Outer Ring */}
                                    <div className="absolute inset-0 rounded-full border border-white/10" />

                                    {/* Glow Dot */}
                                    <div className={`absolute left-0 top-2 h-3 w-3 rounded-full ${f.dot} blur-[1px]`} />

                                    {/* Icon Box */}
                                    <div
                                        className={`relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br ${f.color} text-4xl text-white ${f.glow} transition-transform duration-500 group-hover:scale-110`}
                                    >
                                        {f.emoji}
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
                                <span className="pointer-events-none absolute bottom-0 right-4 text-[110px] font-black leading-none text-white/[0.03]">
                                    0{f.id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}