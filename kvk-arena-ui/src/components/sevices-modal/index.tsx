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
      "Train in a modern fitness space built for strength, cardio, and active recovery. KVK Arena's gym is designed to support regular workouts, focused sessions, and an easy training routine for members at every level.",
  },
  {
    title: "Car Wash",
    icon: Car,
    description:
      "Keep your vehicle clean and ready with our professional car wash service. From wash and shine care to a polished finish, we help you maintain a spotless look with reliable, hassle-free service.",
  },
  {
    title: "Badminton Courts",
    icon: Trophy,
    description:
      "Book a fast-paced indoor court for practice, friendly matches, or competitive play. Our badminton space is set up for comfort, movement, and a great experience every time you step on court.",
  },
  {
    title: "Gaming Centre",
    icon: Gamepad2,
    description:
      "Relax and play in a dedicated gaming zone with a premium setup. It is a space built for casual gaming, group sessions, and a fun break between your other activities at the arena.",
  },
  {
    title: "Café",
    icon: Coffee,
    description:
      "Take a break at the café with coffee, snacks, and light refreshments in a cozy setting. It is the ideal stop to recharge before or after your workout, game, or sports session.",
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
            <h1 className="text-2xl font-bold text-gray-900">
              Everything Under One Roof
            </h1>
            <p className="mt-1 text-gray-600">
              Explore the core experiences available across fitness, sport, leisure, and refreshment.
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
                    Connected experiences under one arena
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