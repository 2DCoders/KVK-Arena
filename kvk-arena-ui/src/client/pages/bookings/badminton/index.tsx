import { useMemo, useState } from "react";
import court from "@/assets/court.png";

export default function BadmintonBookings() {
    const courts = [
        { id: "COURT 01" },
        { id: "COURT 02" },
        { id: "COURT 03" },
        { id: "COURT 04" },
    ];

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);

            return {
                day: date
                    .toLocaleDateString("en-US", { weekday: "short" })
                    .toUpperCase(),
                date: date.getDate(),
                month: date
                    .toLocaleDateString("en-US", { month: "short" })
                    .toUpperCase(),
            };
        });
    }, []);

    const slots = [
        "9.00 AM - 10.00 AM",
        "10.00 AM - 11.00 AM",
        "11.00 AM - 12.00 PM",
        "12.00 PM - 1.00 PM",
        "1.00 PM - 2.00 PM",
        "2.00 PM - 3.00 PM",
        "3.00 PM - 4.00 PM",
        "4.00 PM - 5.00 PM",
        "5.00 PM - 6.00 PM",
        "6.00 PM - 7.00 PM",
    ];

    const [selectedCourt, setSelectedCourt] = useState(0);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(5);

    return (
        <section className="bg-[#f7f7f7] py-20">
            <div className="mx-auto max-w-7xl px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h2 data-aos="fade-up" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                        Book Your Time
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-600" data-aos="fade-up" data-aos-delay="100">
                        Book your court in just a few clicks and enjoy world-class badminton facilities, flexible time slots, and a hassle-free playing experience at KVK Arena.
                    </p>
                </div>

                <div className="mb-10 overflow-x-auto">
                    <div className="flex gap-6 pb-2" data-aos="fade-up" data-aos-delay="150">
                        {courts.map((courtItem, index) => (
                            <button
                                key={courtItem.id}
                                onClick={() => setSelectedCourt(index)}
                                className={`relative cursor-pointer min-w-[320px] overflow-hidden rounded-xl transition-all ${selectedCourt === index
                                        ? "ring-4 ring-blue-500"
                                        : "hover:scale-[1.02]"
                                    }`}
                            >
                                <img
                                    src={court}
                                    alt={courtItem.id}
                                    className="h-52 w-[320px] object-cover"
                                />

                                <div className="absolute bottom-4 left-4 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                                    {courtItem.id}
                                </div>

                                <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                                    Available
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dates */}
                <div className="border-b border-gray-300 pb-10" data-aos="fade-up" data-aos-delay="200">
                    <div className="grid grid-cols-7 gap-4">
                        {dates.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDate(index)}
                                className={`flex h-[110px] cursor-pointer flex-col items-center justify-center rounded-md transition-all ${selectedDate === index
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-black hover:bg-gray-200"
                                    }`}
                            >
                                <span className="text-sm font-bold">
                                    {item.day}
                                </span>

                                <span className="text-4xl font-bold">
                                    {item.date}
                                </span>

                                <span className="text-sm font-bold">
                                    {item.month}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Slots */}
                <div className="grid gap-10 border-b border-gray-300 py-12 md:grid-cols-2" data-aos="zoom-in" data-aos-delay="250">
                    {slots.map((slot, index) => (
                        <button
                            key={slot}
                            onClick={() => setSelectedSlot(index)}
                            className={`flex h-16 cursor-pointer items-center justify-center rounded border text-lg font-semibold transition-all
                                    ${selectedSlot === index
                                    ? "border-black bg-black text-white"
                                    : "border-gray-400 bg-white hover:bg-gray-100"
                                        }
                                    `}
                        >
                            {slot}
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
                    <h3 className="text-2xl font-bold text-gray-700">
                        {courts[selectedCourt].id} ({slots[selectedSlot]})
                    </h3>

                    <button className="rounded-md cursor-pointer bg-blue-600 px-10 py-4 font-semibold text-white transition hover:bg-blue-700">
                        Book Now
                    </button>
                </div>
            </div>
        </section>
    );
}