import { useState } from "react"

import gym from "@/assets/gym.png"
import carwash from "@/assets/carwash.jpeg"
import badminton from "@/assets/badminton.jpg"
import gaming from "@/assets/pool.jpg"

const services = [
    {
        id: 1,
        title: "Gym",
        tag: "Fitness",
        category: "gym",
        desc: "Modern training space for strength, cardio, and active recovery.",
        img: gym,
    },
    {
        id: 2,
        title: "Car Wash",
        tag: "Cleaning",
        category: "carwash",
        desc: "Professional wash and shine services to keep vehicles spotless.",
        img: carwash,
    },
    {
        id: 3,
        title: "Badminton Court",
        tag: "Sport",
        category: "badminton",
        desc: "Fast-paced indoor court booking for training and friendly matches.",
        img: badminton,
    },
    {
        id: 4,
        title: "Gaming Centre",
        tag: "Entertainment",
        category: "gaming",
        desc: "Relax and play in a dedicated gaming zone with a premium setup.",
        img: gaming,
    }
]

const tabs = [
    { key: "all", label: "All Services" },
    { key: "gym", label: "Gym" },
    { key: "carwash", label: "Car Wash" },
    { key: "badminton", label: "Badminton" },
    { key: "gaming", label: "Gaming" },
]

export default function Services() {
    const [activeTab, setActiveTab] = useState("all")

    const visibleServices = activeTab === "all"
        ? services
        : services.filter((service) => service.category === activeTab)

    return (
        <section className="relative overflow-hidden bg-white/5 py-10 lg:py-16">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                        Our Core Services
                    </h2>
                    <p className="mt-4 text-base text-slate-500">
                        From AI solutions to custom development, we provide the tools and expertise to help your business grow smarter, faster, and more efficiently.
                    </p>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 lg:flex-row">
                    <button
                        type="button"
                        onClick={() => setActiveTab("all")}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        View All
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                                        ? "bg-[#296BE1] text-white shadow-[0_10px_30px_rgba(41,107,225,0.28)]"
                                        : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleServices.map((service) => (
                        <article
                            key={service.id}
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(2,8,23,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                        >
                            <div className="relative aspect-[2/3] w-full">
                                <img src={service.img} alt={service.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-linear-to-b from-slate-950/10 via-slate-950/35 to-slate-950/90" />

                                <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                                    <div>
                                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                                            {service.tag}
                                        </span>
                                        <h3 className="mt-4 text-2xl font-bold leading-tight text-white">
                                            {service.title}
                                        </h3>
                                        <p className="mt-3 max-w-[18ch] text-sm leading-6 text-slate-200/90">
                                            {service.desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6">
                                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#CFEFFF]">
                                            {service.category}
                                        </span>
                                        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#296BE1] shadow-[0_10px_25px_rgba(255,255,255,0.18)] transition hover:scale-105">
                                            →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}

                    {visibleServices.length === 0 && (
                        <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
                            No services found for this tab.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}