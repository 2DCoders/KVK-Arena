import { Eye } from "lucide-react";

import gym from "@/assets/gallery/gym-g.jpg";
import carwash from "@/assets/gallery/carwash-g.jpg";
import badmintom from "@/assets/gallery/badminton-g.jpg";
import gaming from "@/assets/gallery/pool-g.jpg";
import cafe from "@/assets/gallery/cafe-g.jpg";

const galleryItems = [
    { id: 1, src: gym, alt: "transformation 1" },
    { id: 2, src: carwash, alt: "transformation 2" },
    { id: 3, src: badmintom, alt: "transformation 3" },
    { id: 4, src: gaming, alt: "transformation 4" },
    { id: 5, src: cafe, alt: "transformation 5" },
]

export default function Gallery() {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#06162d_52%,#020617_100%)] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-1 lg:items-start">
                    <div className="grid grid-cols-1 items-start gap-6 text-center lg:grid-cols-2 lg:text-left">
                        <h2 data-aos="fade-right" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                            Where Passion Meets Performance
                        </h2>

                        <p data-aos="fade-left" data-aos-delay="100" className="text-base text-slate-300 lg:justify-self-end lg:max-w-xl lg:text-left">
                            Explore our before and after gallery to see how we bring damaged vehicles back to top condition — clean, sharp, and road-ready.
                        </p>
                    </div>

                    <div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                            {galleryItems.slice(0, 3).map((item) => (
                                <div key={item.id} data-aos="zoom-in" data-aos-delay="200" className="group relative col-span-1 w-full overflow-hidden rounded-sm cursor-pointer">
                                    <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105 sm:aspect-[4/5] lg:aspect-[16/10]" />
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
                                        5 images
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                            View Album
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            {galleryItems.slice(3).map((item) => (
                                <div key={item.id} data-aos="zoom-in" data-aos-delay="200" className="group relative col-span-1 w-full overflow-hidden rounded-sm cursor-pointer">
                                    <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105 sm:aspect-[16/10] lg:aspect-[2/1]" />
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
                                        5 images
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black">
                                            View Album
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}