import court from "@/assets/court.png";
import { useState } from "react";

const courts = [
    {
        id: 1,
        title: "Court 01",
        price: "LKR 2,500/hr",
        description:
            "Professional badminton court with premium flooring and lighting.",
        features: ["AC", "LED Lighting", "Premium Flooring"],
    },
    {
        id: 2,
        title: "Court 02",
        price: "LKR 2,500/hr",
        description:
            "Tournament-standard court designed for training and competitions.",
        features: ["AC", "Changing Room", "Locker Access"],
    },
    {
        id: 3,
        title: "Court 03",
        price: "LKR 3,000/hr",
        description:
            "VIP court with enhanced facilities and seating area.",
        features: ["VIP Seating", "Premium Lighting", "Shower Room"],
    },
    {
        id: 4,
        title: "Court 04",
        price: "LKR 2,000/hr",
        description:
            "Affordable court ideal for casual matches and practice sessions.",
        features: ["Indoor", "Scoreboard", "Parking"],
    },
    {
        id: 5,
        title: "Court 04",
        price: "LKR 2,000/hr",
        description:
            "Affordable court ideal for casual matches and practice sessions.",
        features: ["Indoor", "Scoreboard", "Parking"],
    },
];

export default function Courts() {
    const [activeCourt, setActiveCourt] = useState(0);

    return (
        <section className="bg-black py-20 text-white overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                {/* Heading */}
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:justify-between">
                    <div>
                        <p className="mb-2 text-[#296BE1] font-semibold">
                            OUR COURTS
                        </p>

                        <h2 className="max-w-xl text-5xl font-bold leading-tight">
                            Explore Our Incredible Amenities & Services
                        </h2>
                    </div>

                    <p className="max-w-md text-gray-400">
                        Crafted for ultimate comfort, safety, and performance.
                        Every court is thoroughly equipped to meet the needs
                        of players and enhance their experience.
                    </p>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-4">
                    {courts.map((courtItem, index) => {
                        const isActive = activeCourt === index;

                        return (
                            <div
                                key={courtItem.id}
                                onMouseEnter={() => setActiveCourt(index)}
                                className={`
                                    relative
                                    h-[520px]
                                    overflow-hidden
                                    rounded-[32px]
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                    transition-all
                                    duration-500
                                    cursor-pointer
                                    flex-shrink-0
                                    ${isActive
                                        ? "w-[700px]"
                                        : "w-[140px]"
                                    }
                                `}
                            >
                                {/* Background */}
                                <img
                                    src={court}
                                    alt={courtItem.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-black/50" />

                                {/* Collapsed */}
                                {!isActive && (
                                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rotate-[-90deg] whitespace-nowrap text-3xl font-light text-white">
                                        {courtItem.title}
                                    </div>
                                )}

                                {/* Expanded */}
                                {isActive && (
                                    <div className="absolute inset-0 flex">
                                        {/* Image */}
                                        <div className="w-1/2 p-5">
                                            <img
                                                src={court}
                                                alt={courtItem.title}
                                                className="h-full w-full rounded-3xl object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex w-1/2 flex-col justify-end p-8">
                                            <span className="mb-3 text-[#296BE1]">
                                                Premium Court
                                            </span>

                                            <h3 className="mb-3 text-5xl font-bold text-white">
                                                {courtItem.title}
                                            </h3>

                                            <p className="mb-5 text-zinc-300">
                                                {courtItem.description}
                                            </p>

                                            <div className="mb-5 flex flex-wrap gap-2">
                                                {courtItem.features.map((feature) => (
                                                    <span
                                                        key={feature}
                                                        className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-white"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mb-6 text-3xl font-bold text-[#296BE1]">
                                                {courtItem.price}
                                            </div>

                                            <button className="w-fit rounded-full bg-[#296BE1] px-8 py-3 font-semibold text-white hover:bg-blue-600 cursor-pointer">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}