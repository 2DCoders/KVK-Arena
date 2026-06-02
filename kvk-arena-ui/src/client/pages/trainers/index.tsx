import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import t1 from "@/assets/trainer.jpg";
import t2 from "@/assets/trainer.jpg";
import t3 from "@/assets/trainer.jpg";
import t4 from "@/assets/trainer.jpg";
import t5 from "@/assets/trainer.jpg";
import t6 from "@/assets/trainer.jpg";

const trainers = [
    { id: 1, name: "Michael Carter", role: "Strength Coach", rating: 4.9, image: t1 },
    { id: 2, name: "Sophia Williams", role: "Personal Trainer", rating: 5.0, image: t2 },
    { id: 3, name: "Daniel Roberts", role: "Fitness Specialist", rating: 4.8, image: t3 },
    { id: 4, name: "Emma Johnson", role: "Nutrition Coach", rating: 4.9, image: t4 },
    { id: 5, name: "James Anderson", role: "CrossFit Trainer", rating: 4.7, image: t5 },
    { id: 6, name: "Olivia Brown", role: "Body Transformation Coach", rating: 5.0, image: t6 },
];

export default function Trainers() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        scrollRef.current.scrollBy({
            left: direction === "left" ? -350 : 350,
            behavior: "smooth",
        });
    };

    return (
        <section className="relative py-20 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#296BE1]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#296BE1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">

                    <div className="max-w-2xl">
                        <h2
                            data-aos="fade-up"
                            data-aos-delay="100"
                            className="text-3xl font-extrabold sm:text-4xl lg:text-5xl bg-linear-to-r from-black via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent"
                        >
                            Professional Trainers
                        </h2>

                        <p
                            data-aos="fade-up"
                            data-aos-delay="150"
                            className="mt-4 text-base text-slate-500"
                        >
                            Train alongside experienced fitness professionals dedicated to
                            helping you build strength, improve performance, and achieve
                            lasting results through expert guidance and personalized support.
                        </p>
                    </div>

                    {/* Arrows */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll("left")}
                            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 border border-white shadow-lg hover:bg-[#296BE1] hover:text-white transition-all duration-300 flex items-center justify-center"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={() => scroll("right")}
                            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 border border-white shadow-lg hover:bg-[#296BE1] hover:text-white transition-all duration-300 flex items-center justify-center"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Slider */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                >
                    {trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className="group flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer"
                        >
                            <div className="
                                relative
                                bg-white/70
                                backdrop-blur-xl
                                rounded-3xl
                                overflow-hidden
                                border border-white
                                shadow-lg
                                hover:shadow-[0_20px_60px_rgba(41,107,225,0.18)]
                                hover:-translate-y-3
                                transition-all
                                duration-500
                            ">

                                {/* Image */}
                                <div className="relative aspect-[2/3] overflow-hidden">

                                    <img
                                        src={trainer.image}
                                        alt={trainer.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute inset-0 bg-[#296BE1]/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                    {/* Rating */}
                                    <div className="absolute top-5 right-5 flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-semibold text-black">
                                            {trainer.rating}
                                        </span>
                                    </div>

                                    {/* View More */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button className="
                                            px-6 py-3
                                            rounded-full
                                            bg-white
                                            text-black
                                            font-semibold
                                            shadow-xl
                                            opacity-0
                                            translate-y-5
                                            group-hover:opacity-100
                                            group-hover:translate-y-0
                                            transition-all
                                            duration-500
                                            hover:bg-[#296BE1]
                                            hover:text-white
                                            cursor-pointer
                                        ">
                                            View More
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 backdrop-blur-md bg-white/40">
                                    <h3 className="text-xl font-bold text-black mb-2">
                                        {trainer.name}
                                    </h3>

                                    <p className="
                                        inline-flex
                                        px-3
                                        py-1
                                        rounded-full
                                        bg-[#296BE1]/10
                                        text-[#296BE1]
                                        text-sm
                                        font-semibold
                                        mb-4
                                    ">
                                        {trainer.role}
                                    </p>

                                    <div className="h-px bg-gray-100 mb-4" />

                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Dedicated to helping members reach peak performance through
                                        professional coaching and proven training methods.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}