import Map from "@/components/map"
import { Send } from "lucide-react"

export default function ContactUs() {
    return (
        <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 py-20 lg:py-28">
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
                                    <button type="submit" className="inline-flex items-center gap-3 rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be]">
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
            </div>
        </section>
    )
}
