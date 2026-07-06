import { ArrowRight } from "lucide-react"

import gym from "@/assets/about.png"
import badminton from "@/assets/about2.jpg"
import { useState } from "react";
import ServicesModal from "@/components/sevices-modal";

const stats = [
    { value: "4", label: "Core Services" },
    { value: "1", label: "Connected Arena" },
    { value: "24/7", label: "Easy Booking" },
    { value: "100%", label: "Member Focus" },
]

export default function AboutUs() {
    const [openServicesModal, setOpenServicesModal] = useState(false);

    return (
        <section className="relative overflow-hidden bg-white py-16 lg:py-30">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,134,252,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(41,107,225,0.08),transparent_30%)]" />

            <ServicesModal open={openServicesModal} onClose={() => setOpenServicesModal(false)} />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <div className="max-w-2xl">
                            <h2 data-aos="fade-right" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                                About KVK Arena
                            </h2>

                            <p data-aos="fade-right" data-aos-delay="100" className="mt-5 text-base leading-8 text-slate-500">
                                KVK Arena brings gym training, car wash care, badminton play, and gaming into one connected experience. We design every service around convenience, comfort, and a smooth day for our members.
                            </p>

                            <p data-aos="fade-right" data-aos-delay="150" className="mt-4 text-base leading-8 text-slate-500">
                                From the first booking to the final visit, our goal is to keep everything easy, fast, and dependable. Whether you are here to move, relax, or get things done, the arena is built to keep your routine flowing.
                            </p>

                            <div className="mt-8 flex gap-4 sm:flex-row">
                                <a href="#services">
                                    <button
                                        data-aos="fade-right" data-aos-delay="250"
                                        type="button"
                                        className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-full bg-[#296BE1] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be] sm:px-7 sm:py-3 sm:text-sm"
                                    >
                                        Explore Services
                                        <ArrowRight size={16} />
                                    </button>
                                </a>


                                <button
                                    data-aos="fade-right" data-aos-delay="250"
                                    type="button"
                                    onClick={() => setOpenServicesModal(true)}
                                    className="inline-flex items-center cursor-pointer justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 sm:px-7 sm:py-3 sm:text-sm"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-140 lg:max-w-none">
                        <div className="absolute -right-4 -top-4 hidden h-32 w-32 rounded-full border border-dashed border-slate-300/80 lg:block" />

                        <div className="relative" data-aos="fade-left">
                            <div className="overflow-hidden rounded-[10px] shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                                <img src={gym} alt="KVK Arena gym" className="h-90 w-full object-cover sm:h-105" />
                            </div>

                            <div className="absolute -bottom-12 right-4 w-[52%] overflow-hidden rounded-[10px] shadow-[0_20px_50px_rgba(15,23,42,0.18)] ring-1 ring-white sm:w-[48%]">
                                <img src={badminton} alt="KVK Arena badminton court" className="h-56 w-full object-cover sm:h-64" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:mt-20 lg:gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}