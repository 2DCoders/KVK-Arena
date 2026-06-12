import {
  Monitor,
  Gamepad2,
  Trophy,
  Clapperboard,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "PC Games",
    description:
      "Experience high-end gaming PCs with the latest AAA titles, esports games, and ultra-smooth performance.",
    icon: Monitor,
    color: "bg-green-500",
  },
  {
    title: "PS5 Games",
    description:
      "Enjoy next-generation console gaming with PlayStation 5, premium controllers, and exclusive titles.",
    icon: Gamepad2,
    color: "bg-red-500",
  },
  {
    title: "Pool",
    description:
      "Challenge your friends on professional pool tables in a stylish and competitive environment.",
    icon: Trophy,
    color: "bg-blue-500",
  },
  {
    title: "Private Movie Rooms",
    description:
      "Relax in premium private cinema rooms with immersive sound, comfortable seating, and big screens.",
    icon: Clapperboard,
    color: "bg-purple-500",
  },
];

export default function GamingServices() {
  return (
    <section className="py-14 bg-[#f8f8f8]">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-500">
            Our Services
          </span>
          <h2 className="mt-5 bg-gradient-to-r from-black via-red-500 to-red-400 bg-clip-text text-5xl font-black text-transparent">
            What We Offer
          </h2>

          <p className="mt-5 text-gray-500 leading-relaxed">
            Discover premium entertainment experiences designed for gamers,
            movie lovers, and friends seeking unforgettable moments.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                data-aos="fade-up"
                data-aos-delay={index * 100}
                key={index}
                className="
                group
                relative
                bg-white
                rounded-[28px]
                p-8
                shadow-md
                transition-all
                duration-700
                ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-1.5
                hover:scale-[1.02]
                hover:shadow-2xl
              "
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mb-8`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>

                <p className="text-gray-500 leading-relaxed mb-15">
                  {service.description}
                </p>

                {/* Button */}
                <button className="group/btn absolute bottom-8 left-1/3 transform -translate-x-1/2 cursor-pointer inline-flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-black hover:text-white hover:border-black transition-all">
                  View More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
