import {
  Trophy,
  Lightbulb,
  Building2,
  Users,
  Medal,
} from "lucide-react";
import bg from "@/assets/badminton-bg.png";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
  position: string;
};

const features: Feature[] = [
  {
    title: "Tournament Facilities",
    description:
      "Host local and national-level badminton tournaments with professional standards.",
    icon: Medal,
    position:
      "absolute left-1/2 -translate-x-1/2 top-0",
  },
  {
    title: "Professional Indoor Courts",
    description:
      "International-standard courts with premium flooring and grip.",
    icon: Trophy,
    position:
      "absolute left-0 top-32",
  },
  {
    title: "Advanced Lighting System",
    description:
      "Competition-grade LED lighting for maximum visibility.",
    icon: Lightbulb,
    position:
      "absolute right-0 top-32",
  },
  {
    title: "Professional Coaching",
    description:
      "Train with experienced coaches and structured programs.",
    icon: Users,
    position:
      "absolute left-[8%] bottom-20",
  },
  {
    title: "Modern Changing Rooms",
    description:
      "Premium locker rooms with modern facilities and comfort.",
    icon: Building2,
    position:
      "absolute right-[8%] bottom-20",
  },
];

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
};

function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <div className="group rounded-[28px] border border-[#B45F28]/10 bg-white/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#B45F28]/30 hover:shadow-[0_20px_50px_rgba(180,95,40,0.15)]">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B45F28]/10">
        <Icon className="h-7 w-7 text-[#B45F28]" />
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default function BadmintonServices() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F1] py-20 lg:py-28" data-aos="fade-up">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#faf7f2_40%,#f5ede5_100%)]" />

      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DCAA78]/20 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#B45F28]/20 bg-[#B45F28]/5 px-4 py-2 text-sm font-medium text-[#B45F28]">
            Premium Facilities
          </span>

          <h2 className="mt-5 text-5xl font-black text-slate-900 md:text-5xl lg:text-5xl">
            Train Like
            <span className="block text-[#B45F28]">
              A Champion
            </span>
          </h2>

          <p className="mt-5 text-base text-slate-600 md:text-lg">
            Experience world-class badminton facilities designed
            for professional training and competitive play.
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="relative mt-10 hidden min-h-[850px] lg:block">
          {/* Decorative Rings */}
          <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#B45F28]/10" />

          <div className="absolute left-1/2 top-1/2 h-[850px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#B45F28]/5" />

          {/* Player Image */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <img
              src={bg}
              alt="Badminton Player"
              className="w-[850px] object-contain drop-shadow-[0_25px_60px_rgba(180,95,40,0.18)]"
            />
          </div>

          {/* Floating Cards */}
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`${feature.position} z-30 w-[290px]`}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </div>
          ))}
        </div>

        {/* Tablet & Mobile Layout */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}