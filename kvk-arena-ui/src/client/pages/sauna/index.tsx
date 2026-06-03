import saunaImage from "@/assets/sauna.png";

export default function SaunaPage() {
    return (
        <section className="w-full bg-white py-20 px-6 md:px-16">
            <div className="max-w-7xl mx-auto">

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div>
                        <h2 data-aos="fade-up" data-aos-delay="100" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                            Train Hard. Recover Smarter.
                        </h2>

                        <ul className="space-y-4 text-gray-700 pt-0 mt-6" data-aos="fade-right" data-aos-delay="150">
                            {[
                                "Premium Strength & Cardio Equipment",
                                "Spacious Training Environment",
                                "Certified Personal Trainers",
                                "Freelance Trainer Friendly",
                                "Sauna & Recovery Facilities",
                                "Modern Changing Rooms",
                                "Community-Focused Atmosphere",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-black" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Image */}
                    <div className="relative" data-aos="fade-left" data-aos-delay="200">
                        <img
                            src={saunaImage}
                            alt="Gym Sauna Facility"
                            className="w-full h-[450px] object-cover rounded-2xl shadow-lg"
                        />

                        {/* subtle overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-black/5" />
                    </div>
                </div>

                {/* Bottom Advertisement Banners */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Left Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-10 md:p-14 shadow-2xl">

                        {/* Glow effects */}
                        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                        <div className="relative max-w-3xl">

                            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs tracking-widest text-gray-300">
                                PREMIUM WELLNESS FEATURE
                            </span>

                            <h3 className="mt-5 text-3xl md:text-4xl font-bold text-white leading-tight">
                                Included Sauna Access
                            </h3>

                            <p className="mt-4 text-gray-300 text-base md:text-lg leading-relaxed">
                                Recover faster, relieve muscle tension, and enjoy a premium wellness experience
                                after every workout. Our sauna facilities are designed to support both physical
                                recovery and mental relaxation.
                            </p>
                        </div>
                    </div>

                    {/* Right Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-gray-900 to-black p-10 md:p-14 shadow-2xl">

                        {/* Glow effects */}
                        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                        <div className="relative">

                            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs tracking-widest text-gray-300">
                                GYM PARTNER PROGRAM
                            </span>

                            <h3 className="mt-5 text-3xl md:text-4xl font-bold text-white leading-tight">
                                Freelance Trainer Friendly
                            </h3>

                            <p className="mt-4 text-gray-300 text-base md:text-lg leading-relaxed ml-auto max-w-2xl">
                                We welcome freelance trainers with flexible access, client management support,
                                and a professional environment to grow your personal training business inside our facility.
                            </p>

                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}