const goals = [
    { title: "Stronger", description: "Build your strength" },
    { title: "Healthier", description: "Improve your fitness" },
    { title: "Better", description: "Push your limits" },
    { title: "Together", description: "Grow with the community" },
];

export default function StatsGym() {
    return (
        <section aria-label="Fitness goals" className="bg-[#f5f5f5] px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pt-15">
            <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center sm:gap-8 md:grid-cols-4 lg:gap-10">
                {goals.map(({ title, description }) => (
                    <li
                        key={title}
                        className="rounded-2xl border border-slate-200 bg-linear-to-br from-white to-blue-50/70 p-4 shadow-sm sm:p-6"
                    >
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-blue-700 sm:text-base">
                            {title}
                        </h3>
                        <p className="mt-2 text-xs leading-snug text-slate-700 sm:text-sm">
                            {description}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
