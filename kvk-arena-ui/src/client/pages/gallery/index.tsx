import { Eye } from "lucide-react";

import gym from "@/assets/gym.png";
import carwash from "@/assets/carwash.jpeg";
import badmintom from "@/assets/badminton.jpg";
import gaming from "@/assets/pool.jpg";
import cafe from "@/assets/cafe.jpg";

export default function Gallery() {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#06162d_52%,#020617_100%)] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-1 lg:items-start">
                    <div className="grid grid-cols-1 items-start gap-6 text-center lg:grid-cols-2 lg:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                            Where Passion Meets Performance
                        </h2>

                        <p className="text-base text-slate-300 lg:justify-self-end lg:max-w-xl lg:text-left">
                            Explore our before and after gallery to see how we bring damaged vehicles back to top condition — clean, sharp, and road-ready.
                        </p>
                    </div>

                    <div className="order-first lg:order-last">
                        <div className="grid grid-cols-3 gap-1 sm:gap-6">
                            <div className="group relative col-span-1 overflow-hidden rounded-sm cursor-pointer">
                                <img src={gym} alt="transformation 1" className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-48 lg:h-56" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                        View Album
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="group relative col-span-1 overflow-hidden rounded-sm cursor-pointer">
                                <img src={carwash} alt="transformation 2" className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-48 lg:h-56" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                        View Album
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="group relative col-span-1 overflow-hidden rounded-sm cursor-pointer">
                                <img src={badmintom} alt="transformation 3" className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-48 lg:h-56" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                        View Album
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-1 sm:gap-6">
                            <div className="group relative col-span-1 overflow-hidden rounded-sm cursor-pointer">
                                <img src={gaming} alt="transformation 4" className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-64 lg:h-72" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                        View Album
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="group relative col-span-1 overflow-hidden rounded-sm cursor-pointer">
                                <img src={cafe} alt="transformation 5" className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-64 lg:h-72" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                        View Album
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}