import heroImg from "@/assets/hero/gym-hero.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20 mt-20">
        
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:gap-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              One arena for
              <span className="block bg-gradient-to-r from-[#296BE1] via-slate-900 to-[#296BE1] bg-clip-text text-transparent">
                movement, play, care.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              Explore four connected experiences in a modern light-space design: Gym, Carwash, Badminton Court, and Gaming Centre. Book faster, move easier, and keep your day flowing in one place.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button className="inline-flex items-center justify-center rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1f58be]">
                Sign Up Now
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-[#296BE1]/30 bg-white px-6 py-3 text-sm font-semibold text-[#296BE1] shadow-sm hover:bg-[#296BE1]/5">
                Sign In
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Left card */}
            <div className="order-2 sm:order-1">
              <div className="h-full rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-lg font-semibold text-slate-900">Chat with us in AI Support</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#296BE1]/10 flex items-center justify-center text-[#296BE1]">🤖</div>
                    <div className="rounded-lg bg-[#f1f5ff] px-3 py-2 text-sm text-slate-700">Hello! How are you?</div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">I'm fine | Can I help you?</div>
                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">🙂</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center large image */}
            <div className="order-1 sm:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-xl">
                <img src={heroImg} alt="Hero" className="h-64 w-full object-cover sm:h-80 md:h-96" />
                <div className="absolute left-6 bottom-6 rounded-xl bg-white/90 px-4 py-3 shadow-md">
                  <div className="text-2xl font-bold text-slate-900">9000+</div>
                  <div className="text-sm text-slate-600">Businesses trust Chatbase</div>
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="order-3">
              <div className="h-full rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-lg font-semibold text-slate-900">Always accessible with our live chat</h3>
                <p className="mt-3 text-sm text-slate-600">Experience seamless support with our always accessible live chat feature.</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm">User message preview</div>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">Another message preview</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          section > div > div { align-items: start }
        }
      `}</style>
    </section>
  );
}