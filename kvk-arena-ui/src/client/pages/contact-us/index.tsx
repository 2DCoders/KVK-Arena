import Map from "@/components/map"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactUs() {
    return (
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 py-20 lg:py-28">

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
                    {/* Left: modern contact card */}
                    <div className="relative">
                        <div className="rounded-2xl bg-linear-to-br from-slate-800/80 to-slate-800/70 p-8 shadow-xl lg:backdrop-blur-sm">
                            <h2 data-aos="fade-right" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                                Get In Touch With Us
                            </h2>

                            <p data-aos="fade-right" data-aos-delay="100" className="mt-4 text-base text-slate-300 max-w-2xl">
                                Need help booking, membership details, or corporate packages? Send a quick message and our arena team will respond within one business day.
                            </p>

                            <form data-aos="fade-right" data-aos-delay="200" className="mt-8 grid gap-4">
                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    <label className="sr-only">Name</label>
                                    <input aria-label="Name" placeholder="Name" className="rounded-md border border-transparent bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#296BE1]/40" />

                                    <label className="sr-only">Email</label>
                                    <input aria-label="Email" placeholder="Email" className="rounded-md border border-transparent bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#296BE1]/40" />
                                </div>

                                <label className="sr-only">Message</label>
                                <textarea aria-label="Message" placeholder="Message" rows={3} className="rounded-md border border-transparent bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#296BE1]/40" />

                                <div className="flex items-center gap-4">
                                    <button type="submit" className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be]">
                                        <Send size={16} />
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: clean map card */}
                    <div className="relative flex items-center justify-center" data-aos="fade-left" data-aos-delay="200">
                        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10 md:hidden">
                            <div className="flex h-full min-h-72 flex-col justify-between bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6 text-slate-900">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#296BE1]">
                                        Find Us
                                    </p>
                                    <h3 className="mt-3 text-2xl font-extrabold tracking-tight">
                                        KVK Arena
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Open the map in Google Maps for directions. The live map is shown on larger screens.
                                    </p>
                                </div>

                                <a
                                    href="https://maps.app.goo.gl/AUDR2VgjT6JbvmvR8"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-full bg-[#296BE1] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be]"
                                >
                                    Open Map
                                </a>
                            </div>
                        </div>

                        <div className="hidden w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10 md:block">
                            <div className="aspect-square w-full sm:aspect-auto sm:h-113">
                                <Map
                                    locationLink="https://maps.app.goo.gl/AUDR2VgjT6JbvmvR8"
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Info Cards */}
                <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">

                    {/* Mobile */}
                    <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(45,134,252,0.25)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#2d86fc]/10 text-[#2d86fc] group-hover:scale-110 transition">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Mobile</p>
                                <p className="text-sm font-semibold text-white">
                                    +94 76 560 5885
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(124,58,237,0.25)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="text-sm font-semibold text-white">
                                    kvkarena28@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(207,239,255,0.15)]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 group-hover:scale-110 transition">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Address</p>
                                <p className="text-sm font-semibold text-white">
                                    No.387, Galle road, Colombo 4
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Working Days */}
                    <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300 group-hover:scale-110 transition">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Working Days</p>
                                <p className="text-sm font-semibold text-white">
                                    Monday – Sunday
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </section>
    )
}
