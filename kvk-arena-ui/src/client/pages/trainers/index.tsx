import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import t1 from "@/assets/trainer.jpg";
import t2 from "@/assets/trainer.jpg";
import t3 from "@/assets/trainer.jpg";
import t4 from "@/assets/trainer.jpg";
import t5 from "@/assets/trainer.jpg";
import t6 from "@/assets/trainer.jpg";

const trainers = [
    {
        id: 1,
        name: "Michael Carter",
        role: "Strength Coach",
        image: t1,
    },
    {
        id: 2,
        name: "Sophia Williams",
        role: "Personal Trainer",
        image: t2,
    },
    {
        id: 3,
        name: "Daniel Roberts",
        role: "Fitness Specialist",
        image: t3,
    },
    {
        id: 4,
        name: "Emma Johnson",
        role: "Nutrition Coach",
        image: t4,
    },
    {
        id: 5,
        name: "James Anderson",
        role: "CrossFit Trainer",
        image: t5,
    },
    {
        id: 6,
        name: "Olivia Brown",
        role: "Body Transformation Coach",
        image: t6,
    },
];

export default function Trainers() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const amount = 350;

        scrollRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div className="max-w-2xl">

                        <h2 data-aos="fade-up" data-aos-delay="100" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                            Professional Trainers
                        </h2>

                        <p data-aos="fade-up" data-aos-delay="150" className="mt-4 text-base text-slate-500">
                            Train alongside experienced fitness professionals dedicated to
                            helping you build strength, improve performance, and achieve
                            lasting results through expert guidance and personalized support.
                        </p>
                    </div>

                    {/* Arrows */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll("left")}
                            className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-[#296BE1] hover:text-white hover:border-[#296BE1] transition-all duration-300 flex items-center justify-center shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={() => scroll("right")}
                            className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-[#296BE1] hover:text-white hover:border-[#296BE1] transition-all duration-300 flex items-center justify-center shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Trainers Slider */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                >
                    {trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className="group flex-shrink-0 w-[260px] sm:w-[280px]"
                        >
                            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500">
                                {/* Image (2:3 Ratio) */}
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    <img
                                        src={trainer.image}
                                        alt={trainer.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                    {/* Accent Line */}
                                    <div className="absolute top-5 left-5 w-12 h-1 rounded-full bg-[#296BE1]" />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-black mb-2">
                                        {trainer.name}
                                    </h3>

                                    <p className="text-[#296BE1] font-medium mb-4">
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