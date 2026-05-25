import gym from "@/assets/gym.png"
import carwash from "@/assets/carwash.jpeg"
import badminton from "@/assets/badminton.jpg"
import gaming from "@/assets/pool.jpg"

const services = [
    {
        id: 1,
        title: "AI Automation",
        tag: "AI Solutions",
        desc: "Automate workflows and decision-making engines to speed operations.",
        img: gym,
    },
    {
        id: 2,
        title: "AI Agents Development",
        tag: "All Solutions",
        desc: "Custom agents for data, reporting and integrations.",
        img: carwash,
    },
    {
        id: 3,
        title: "AI Consulting & Strategy",
        tag: "All Solutions",
        desc: "Workshops and roadmaps to adopt AI responsibly.",
        img: badminton,
    },
    {
        id: 4,
        title: "AI MVP Development",
        tag: "Development",
        desc: "Rapid prototypes to validate product-market fit.",
        img: gaming,
    },
    {
        id: 5,
        title: "Dedicated AI Teams",
        tag: "All Solutions",
        desc: "Scale with engineers and product-led squads.",
        img: gym,
    },
    {
        id: 6,
        title: "AI Quality & Monitoring",
        tag: "All Solutions",
        desc: "Observability and assurance for model-driven systems.",
        img: carwash,
    },
]

export default function Services() {
    return (
        <section className="py-16 lg:py-24 bg-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#000000] bg-clip-text text-transparent">
                        Our Core Services
                    </h2>
                    <p className="mt-4 text-base text-slate-500">
                        From AI solutions to custom development, we provide the tools and expertise to help your business grow smarter, faster, and more efficiently.
                    </p>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-3">
                        <button className="rounded-md border border-slate-200/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">View All</button>
                        <div className="hidden sm:flex items-center gap-2">
                            <button className="rounded-md bg-[#296BE1] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(41,107,225,0.16)]">All Solutions</button>
                            <button className="rounded-md border border-white/20 bg-white/6 px-4 py-2 text-sm font-medium text-white">Development</button>
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                        <input aria-label="search services" placeholder="Search services" className="w-full max-w-sm rounded-full bg-white/6 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none" />
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s, idx) => (
                        <article key={s.id} className={`relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-b from-white/3 to-white/2 shadow-lg transition-transform hover:-translate-y-1`}>
                            <div className="absolute inset-0">
                                <img src={s.img} alt={s.title} className="h-full w-full object-cover opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                            </div>

                            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between p-6">
                                <div>
                                    <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{s.tag}</span>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                                    <p className="mt-2 text-sm text-slate-200">{s.desc}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <button className="inline-flex items-center gap-2 rounded-full bg-[#296BE1] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(41,107,225,0.18)] hover:bg-[#1f58be]">Explore</button>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-block h-10 w-10 translate-y-1 rounded-full bg-white/8 text-center text-white/90">›</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}