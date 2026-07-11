import { useEffect, useState } from "react";
import { BadgeCheck, Clock3, Sparkles, ArrowRight } from "lucide-react";
import { getEnv } from "@/env";

import gymImage from "@/assets/gym-signup.jpg";
import MembershipRegistration from "@/components/membership-registration";
import Alert from "@/components/alert";

type TimeLeft = {
    total: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

const OFFER_FALLBACK_END =  getEnv().OFFER_END_DATE; // Fallback date if env variable is not set

function getTimeLeft(targetTime: number): TimeLeft {
    const total = Math.max(0, targetTime - Date.now());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { total, days, hours, minutes, seconds };
}

export default function ArenaMembership() {
    const offerEndValue = OFFER_FALLBACK_END;
    const offerEndDate = new Date(offerEndValue);
    const targetTime = offerEndDate.getTime();
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetTime));
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [pageAlert, setPageAlert] = useState<{ visible: boolean; variant?: "success" | "error" | "warning" | "info"; title?: string; description?: string }>({ visible: false });

    useEffect(() => {
        setTimeLeft(getTimeLeft(targetTime));

        const interval = window.setInterval(() => {
            setTimeLeft(getTimeLeft(targetTime));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [targetTime]);

    const membershipBenefits = [
        "Discounts for every service",
        "Annual renew option",
        "Priority registration handling",
        "WhatsApp follow-up after signup",
    ];

    const isOfferActive = timeLeft.total > 0;

    if (!isOfferActive) {
    return null;
}

    return (
        <section
            id="memberships"
            className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-28"
        >
            {pageAlert.visible && (
                <Alert
                    variant={pageAlert.variant}
                    title={pageAlert.title}
                    description={pageAlert.description}
                    onClose={() => setPageAlert((s) => ({ ...s, visible: false }))}
                />
            )}

            <MembershipRegistration
                open={registrationOpen}
                onClose={() => setRegistrationOpen(false)}
                onSuccess={() => setPageAlert({
                    visible: true,
                    variant: "success",
                    title: "Registration Successful",
                    description: "Your membership application has been submitted successfully. Our team will contact you shortly.",
                })}
                onFailure={() => setPageAlert({
                    visible: true,
                    variant: "error",
                    title: "Registration Failed",
                    description: "There was an issue submitting your membership application. Please try again later.",
                })}
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: `url(${gymImage})` }}
            />

            <div className="absolute inset-0 bg-slate-950/68" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,107,225,0.32),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.96))]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                    <div data-aos="fade-up" data-aos-delay="100" className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#296BE1]/35 bg-[#296BE1]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#CFEFFF] backdrop-blur-sm">
                            <Sparkles size={14} />
                            Limited Time Offer
                        </div>

                        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-6xl">
                            Full Arena Membership
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Join the full arena membership and unlock discounts on every service,
                            plus an annual renew option built for members who want a simple,
                            premium experience.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            {membershipBenefits.map((benefit) => (
                                <span
                                    key={benefit}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-sm"
                                >
                                    <BadgeCheck size={16} className="text-[#8FC0FF]" />
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div data-aos="fade-left" data-aos-delay="200" className="relative">
                        <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-[#296BE1]/20 blur-3xl" />
                        <div className="absolute -right-6 bottom-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/8 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FC0FF]">
                                        Offer Countdown
                                    </p>
                                    <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                        {isOfferActive ? `${timeLeft.days} days left` : "Offer closed"}
                                    </h3>
                                </div>

                                <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Offer end
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white">
                                        {offerEndDate.toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { value: timeLeft.days, label: "Days" },
                                    { value: timeLeft.hours, label: "Hours" },
                                    { value: timeLeft.minutes, label: "Mins" },
                                    { value: timeLeft.seconds, label: "Secs" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-center shadow-[0_20px_55px_rgba(0,0,0,0.22)]"
                                    >
                                        <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                            {String(item.value).padStart(2, "0")}
                                        </div>
                                        <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-3xl border border-[#296BE1]/25 bg-[#000000]/55 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1] text-white shadow-[0_14px_32px_rgba(41,107,225,0.32)]">
                                        <Clock3 size={18} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8FC0FF]">
                                            Registration notes
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-slate-300">
                                            Complete your registration today and our admin will follow up on WhatsApp. This offer is intentionally limited to keep the membership experience personal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setRegistrationOpen(true)}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(41,107,225,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2158bc]"
                                >
                                    Register Now
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}