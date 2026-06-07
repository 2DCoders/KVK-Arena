import bg from "@/assets/badminton-bg.png";
import shuttlecock from "@/assets/shuttlecock.png";

const features = [
  {
    title: "Professional\nIndoor Courts",
    className: "left-[8%] top-[140px]",
  },
  {
    title: "Advanced\nLightning System",
    className: "left-1/2 -translate-x-1/2 top-[30px]",
  },
  {
    title: "Modern\nChanging Rooms",
    className: "right-[8%] top-[140px]",
  },
];

export default function BadmintonServices() {
  return (
    <section className="relative overflow-hidden bg-[#f5f5f5] py-20">
      <div className="relative w-full h-[750px]">
        {/* Curved Line */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1920 750"
          preserveAspectRatio="none"
        >
          <path
            d="M0 520 C350 120, 1570 120, 1920 520"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </svg>

        {/* Feature Circles */}
        {features.map((feature, index) => (
          <div
            key={index}
            className={`absolute ${feature.className} z-10`}
          >
            <div className="flex h-44 w-44 mt-20 flex-col items-center justify-center rounded-full border-2 border-blue-500 bg-white text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <img
                src={shuttlecock}
                alt="shuttlecock"
                className="mb-3 h-10 w-10"
              />

              <p className="whitespace-pre-line text-md font-semibold text-gray-700">
                {feature.title}
              </p>
            </div>
          </div>
        ))}

        {/* Badminton Players Image */}
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2">
          <img
            src={bg}
            alt="Badminton Players"
            className="w-[900px] max-w-[90vw] object-contain"
          />
        </div>
      </div>
    </section>
  );
}