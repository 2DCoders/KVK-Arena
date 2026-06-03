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

                        <ul className="space-y-4 text-gray-700 pt-0 mt-6" data-aos="fade-up" data-aos-delay="150">
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
                    <div className="relative">
                        <img
                            src={saunaImage}
                            alt="Gym Sauna Facility"
                            className="w-full h-[450px] object-cover rounded-2xl shadow-lg"
                        />

                        {/* subtle overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-black/5" />
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="mt-16 bg-gray-900 text-white rounded-2xl p-10 md:p-14">
                    <div className="max-w-3xl">
                        <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                            Included Sauna Access
                        </h3>

                        <p className="text-gray-300 leading-relaxed">
                            Recover faster, relieve muscle tension, and enjoy a premium wellness experience
                            after every workout. Our sauna facilities are designed to support both physical
                            recovery and mental relaxation.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}