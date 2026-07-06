import { X, Dumbbell, Car, Trophy, Gamepad2, Coffee } from "lucide-react";

interface ServicesModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  {
    title: "Gym & Fitness",
    icon: Dumbbell,
    description:
      "Achieve your fitness goals with our fully equipped gym featuring modern cardio machines, strength training equipment, free weights, and professional guidance. Whether you're a beginner or an experienced athlete, our facility provides a comfortable environment to train, improve your health, and stay motivated.",
  },
  {
    title: "Car Wash",
    icon: Car,
    description:
      "Keep your vehicle looking its best with our premium car wash service. We provide thorough exterior and interior cleaning using quality products and professional techniques, ensuring your car leaves spotless, fresh, and protected.",
  },
  {
    title: "Badminton Courts",
    icon: Trophy,
    description:
      "Enjoy high-quality indoor badminton courts designed for both casual games and competitive matches. Our courts offer excellent lighting, premium flooring, and a comfortable playing environment for players of every skill level.",
  },
  {
    title: "Gaming Centre",
    icon: Gamepad2,
    description:
      "Experience the excitement of modern gaming with high-performance gaming stations, multiplayer experiences, and a comfortable atmosphere. Perfect for casual gamers, friends, and competitive gaming sessions.",
  },
  {
    title: "Café",
    icon: Coffee,
    description:
      "Relax and recharge at our café with freshly brewed coffee, refreshing beverages, light meals, and snacks. It's the perfect place to unwind after your workout, game, or sports session while enjoying a welcoming atmosphere.",
  },
];

export default function ServicesModal({
  open,
  onClose,
}: ServicesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50000 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Services We Provide
            </h1>
            <p className="mt-1 text-gray-600">
              Discover everything available at our sports & recreation center.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full cursor-pointer border p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <article
              key={index}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Premium facilities for everyone
                  </p>
                </div>
              </div>

              <p className="leading-8 text-gray-700">
                {service.description}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}