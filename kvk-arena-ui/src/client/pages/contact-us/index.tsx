import Map from "@/components/map"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactUs() {
    return (
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 py-20 lg:py-28">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <svg
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full opacity-45"
                >
                    <defs>
                        <linearGradient id="snakeLineOne" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(45,134,252,0.10)" />
                            <stop offset="50%" stopColor="rgba(207,239,255,0.55)" />
                            <stop offset="100%" stopColor="rgba(41,107,225,0.08)" />
                        </linearGradient>
                        <linearGradient id="snakeLineTwo" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(124,58,237,0.08)" />
                            <stop offset="50%" stopColor="rgba(145,206,255,0.42)" />
                            <stop offset="100%" stopColor="rgba(45,134,252,0.10)" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M-40 170 C 90 85, 150 255, 260 170 S 430 75, 540 145 S 700 275, 830 180 S 1010 75, 1135 155 S 1310 275, 1490 185"
                        fill="none"
                        stroke="url(#snakeLineOne)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="snake-dash"
                        style={{ animationDuration: "16s" }}
                    />
                    <path
                        d="M-60 340 C 80 270, 150 420, 285 352 S 455 240, 585 330 S 770 460, 900 345 S 1095 225, 1225 320 S 1380 430, 1510 350"
                        fill="none"
                        stroke="url(#snakeLineTwo)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="snake-dash"
                        style={{ animationDuration: "20s", animationDirection: "reverse" }}
                    />
                    <path
                        d="M-40 610 C 120 520, 190 700, 330 620 S 500 500, 635 590 S 820 740, 955 630 S 1140 500, 1260 610 S 1395 710, 1500 645"
                        fill="none"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="snake-dash"
                        style={{ animationDuration: "22s" }}
                    />
                </svg>
                <span
                    aria-hidden="true"
                    className="snake-send absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#296BE1] text-white"
                    style={{
                        offsetPath:
                            'path("M-40 170 C 90 85, 150 255, 260 170 S 430 75, 540 145 S 700 275, 830 180 S 1010 75, 1135 155 S 1310 275, 1490 185")',
                        animationDelay: "-4s",
                    }}
                >
                    <Send size={14} strokeWidth={2.6} />
                </span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,134,252,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_30%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
                    {/* Left: modern contact card */}
                    <div className="relative">
                        <div className="rounded-2xl bg-linear-to-br from-slate-800/60 to-slate-800/40 p-8 shadow-xl backdrop-blur-sm">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent">
                                Get In Touch With Us
                            </h2>

                            <p className="mt-4 text-base text-slate-300 max-w-2xl">
                                Need help booking, membership details, or corporate packages? Send a quick message and our arena team will respond within one business day.
                            </p>

                            <form className="mt-8 grid gap-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                                    <p className="text-sm text-slate-400">We reply within 24 hours.</p>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: clean map card */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10">
                            <div className="h-80 sm:h-113">
                                <Map
                                    locationLink="https://maps.app.goo.gl/AUDR2VgjT6JbvmvR8"
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Info Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Mobile */}
                    <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(45,134,252,0.25)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#2d86fc]/10 text-[#2d86fc] group-hover:scale-110 transition">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Mobile</p>
                                <p className="text-sm font-semibold text-white">
                                    +94 77 123 4567
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
                                    info@kvkarena.com
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="group sm:col-span-2 rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(207,239,255,0.15)]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 group-hover:scale-110 transition">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Address</p>
                                <p className="text-sm font-semibold text-white">
                                    KVK Arena, Main Street, Colombo, Sri Lanka
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Working Days */}
                    <div className="group sm:col-span-2 rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300 group-hover:scale-110 transition">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Working Days</p>
                                <p className="text-sm font-semibold text-white">
                                    Monday – Sunday: 6:00 AM – 10:00 PM
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </section>
    )
}
