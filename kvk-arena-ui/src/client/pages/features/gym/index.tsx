import { Rocket, Wallet, Sparkles, BarChart3 } from "lucide-react";

const features = [
    {
        icon: Rocket,
        title: "Quicker Advancement",
        desc: "Achieve your exercise objectives with tailored strategies that adjust to your speed and propel you forward—quicker.",
    },
    {
        icon: Wallet,
        title: "Budget-Friendly Plans",
        desc: "Obtain ultimate perks from versatile schemes with no secret costs—boost your health affordably.",
    },
    {
        icon: Sparkles,
        title: "Intelligent Coaching",
        desc: "Apply science-validated exercises, real-time performance analysis, and AI instruction to train wisely, not intensely.",
    },
    {
        icon: BarChart3,
        title: "Instant Feedback",
        desc: "Monitor your exercises, diet, and recovery with accuracy—notice your advancement, sense the change.",
    },
];

export default function GymFeatures() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-[#296BE1]/10 blur-3xl rounded-full" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h2
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="text-2xl sm:text-4xl lg:text-5xl font-extrabold bg-linear-to-r from-black via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent"
                    >
                        Strong, Reliable, and
                        Constantly Supporting You
                    </h2>

                    <p
                        data-aos="fade-up"
                        data-aos-delay="150"
                        className="mt-4 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto"
                    >
                        Reach fitness objectives through expert advice, smart tracking, and genuine, enduring results.
                    </p>
                </div>

                {/* Grid */}
                <div data-aos="zoom-in" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className="
                                group
                                relative
                                bg-white/70
                                backdrop-blur-xl
                                border border-gray-100
                                rounded-2xl
                                p-5 sm:p-6
                                shadow-sm
                                hover:shadow-[0_20px_50px_rgba(41,107,225,0.15)]
                                hover:-translate-y-2
                                transition-all
                                duration-300
                            "
                        >

                            {/* Icon */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#296BE1]/10 flex items-center justify-center mb-5 group-hover:bg-[#296BE1] transition">
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#296BE1] group-hover:text-white transition" />
                            </div>

                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-black mb-2">
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {item.desc}
                            </p>

                            {/* bottom accent line */}
                            <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#296BE1] to-transparent opacity-0 group-hover:opacity-100 transition" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}