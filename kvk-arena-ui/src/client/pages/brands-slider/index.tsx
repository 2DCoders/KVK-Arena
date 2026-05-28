import brand1 from "@/assets/brands/gym.png";
import brand2 from "@/assets/brands/car-wash.png";
import brand3 from "@/assets/brands/gaming.png";
import brand4 from "@/assets/brands/badminton.png";

const brands = [
  brand1,
  brand2,
  brand3,
  brand4,
  brand1,
  brand2,
  brand3,
  brand4,
];

export default function BrandsSlider() {
  return (
    <div className="w-full overflow-hidden py-10 bg-white/5">
      <div className="relative flex w-max animate-marquee gap-8 sm:gap-25">
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={index}
            className="flex items-center justify-center min-w-[180px]"
          >
            <img
              src={brand}
              alt={`brand-${index}`}
              className="h-30 w-auto object-contain opacity-100 hover:opacity-100 transition duration-300"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}