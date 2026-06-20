import { useEffect, useRef, useState } from "react";

export default function StatsGym() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [startCount, setStartCount] = useState(false);

    const stats = [
        { label: "Members", value: 2500 },
        { label: "Trainers", value: 35 },
        { label: "Memberships", value: 1200 },
        { label: "Machines", value: 120 },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStartCount(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const useCountUp = (end: number, shouldStart: boolean) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!shouldStart) return;

            let start = 0;
            const duration = 1500;
            const increment = end / (duration / 16);

            const counter = setInterval(() => {
                start += increment;

                if (start >= end) {
                    start = end;
                    clearInterval(counter);
                }

                setCount(Math.floor(start));
            }, 16);

            return () => clearInterval(counter);
        }, [shouldStart, end]);

        return count;
    };

    return (
        <section
            ref={sectionRef}
            className="pt-10 sm:pt-12 lg:pt-15 pb-8 sm:pb-10 bg-[#f5f5f5]"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 text-center">
                    {stats.map((item, index) => {
                        const count = useCountUp(item.value, startCount);

                        return (
                            <div
                                key={index}
                                className="
                                rounded-2xl
                                bg-white
                                p-4
                                sm:p-6
                                shadow-sm
                                border
                                border-gray-100
                            "
                            >
                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-600">
                                    {count.toLocaleString()}+
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-gray-500 tracking-wider uppercase">
                                    {item.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}