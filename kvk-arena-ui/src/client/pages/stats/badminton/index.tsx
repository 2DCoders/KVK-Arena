import { useEffect, useRef, useState } from "react";

export default function StatsBadminton() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [startCount, setStartCount] = useState(false);

    const stats = [
        { label: "Courts", value: 4 },
        { label: "Slots", value: 10 },
        { label: "Duration(min)", value: 30 },
        { label: "Clients", value: 500 },
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
        <section ref={sectionRef} className="pt-15 pb-10 bg-[#f5f5f5]">
            <div className="max-w-6xl mx-auto px-6">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {stats.map((item, index) => {
                        const count = useCountUp(item.value, startCount);

                        return (
                            <div key={index}>
                                <h3 className="text-4xl md:text-5xl font-bold text-gray-600">
                                    {count.toLocaleString()} {item.label === "Clients" ? "+" : ""}
                                </h3>
                                <p className="mt-2 text-gray-500 text-sm tracking-wide uppercase">
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