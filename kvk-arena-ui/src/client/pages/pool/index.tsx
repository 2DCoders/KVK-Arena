import poolImage from "@/assets/pool.png"; // replace later
import { Clock3, Trophy } from "lucide-react";

export default function Pool() {
  return (
    <section className="bg-[#0b0b0b] py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div>
          <span className="inline-block px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold border border-red-500/20" data-aos="fade-up">
            POOL
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight" data-aos="fade-up" data-aos-delay="100">
            Experience Premium
            <span className="text-red-500"> Pool Gaming</span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg max-w-xl leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            Challenge friends, sharpen your skills, and enjoy professional
            billiards tables in a premium gaming atmosphere designed for both
            casual and competitive players.
          </p>

          {/* Features */}
          <div className="mt-12 grid sm:grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="300">
            <div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Clock3 className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                Extended Play Hours
              </h3>

              <p className="text-gray-400">
                Enjoy uninterrupted matches with flexible booking and late-night
                gaming sessions.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                Competitive Environment
              </h3>

              <p className="text-gray-400">
                Practice, compete, and improve your game on tournament-quality
                tables.
              </p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative" data-aos="fade-up">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img
              src={poolImage}
              alt="Pool Table"
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Floating Card 1 */}
          <div className="absolute top-10 left-8 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[220px] shadow-2xl">
            <h3 className="text-4xl font-bold text-white">2</h3>
            <p className="text-gray-300 mt-2">Premium Tables</p>

            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-500" />
          </div>

          {/* Floating Card 2 */}
          <div className="absolute bottom-10 left-16 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[240px] shadow-2xl">
            <h3 className="text-4xl font-bold text-white">5000+</h3>
            <p className="text-gray-300 mt-2">Games Played</p>

            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </section>
  );
}