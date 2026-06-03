import { useState } from "react";
import gymImage from "@/assets/gym-signup.jpg";

interface SignupModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SignupModal({
    open,
    onClose,
}: SignupModalProps) {
    const [step, setStep] = useState(1);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-black/10 text-xl hover:bg-black/20"
                >
                    ×
                </button>

                <div className="grid min-h-[650px] md:grid-cols-[40%_60%]">

                    {/* LEFT PANEL */}
                    <div className="relative hidden md:block">
                        <img
                            src={gymImage}
                            alt="Gym"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[#296BE1]/70" />

                        <div className="relative flex h-full flex-col justify-end p-10 text-white">
                            <div className="mb-6 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                                Premium Fitness Club
                            </div>

                            <h2 className="text-5xl font-black leading-tight">
                                Join The
                                <br />
                                Next Level
                            </h2>

                            <p className="mt-5 max-w-sm text-gray-200">
                                Transform your body, improve your health,
                                and achieve your fitness goals with expert
                                trainers and modern equipment.
                            </p>

                            <div className="mt-10 flex gap-8">
                                <div>
                                    <p className="text-3xl font-bold">500+</p>
                                    <span className="text-sm text-gray-300">
                                        Members
                                    </span>
                                </div>

                                <div>
                                    <p className="text-3xl font-bold">15+</p>
                                    <span className="text-sm text-gray-300">
                                        Trainers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="bg-[#FAFAFA] p-6 md:p-10">

                        {/* STEPPER */}
                        <div className="mb-10 flex items-center justify-center">
                            <div className="flex items-center gap-4">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#296BE1] font-semibold text-white">
                                        1
                                    </div>
                                    <span className="font-medium text-slate-700">
                                        Registration
                                    </span>
                                </div>

                                <div className="h-[2px] w-16 bg-gray-300" />

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                            step === 2
                                                ? "border-[#296BE1] bg-[#296BE1] text-white"
                                                : "border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        2
                                    </div>

                                    <span
                                        className={
                                            step === 2
                                                ? "font-medium text-slate-700"
                                                : "text-gray-400"
                                        }
                                    >
                                        Membership
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <>
                                <h3 className="text-3xl font-bold text-slate-900">
                                    Create Account
                                </h3>

                                <p className="mt-2 text-gray-500">
                                    Complete your registration details.
                                </p>

                                <div className="mt-8 grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#296BE1]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#296BE1]"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#296BE1]"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium">
                                            Phone Number
                                        </label>

                                        <div className="flex overflow-hidden rounded-xl border border-gray-300">
                                            <div className="flex items-center bg-gray-100 px-4 font-medium">
                                                +94
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="77 123 4567"
                                                className="w-full px-4 py-3 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#296BE1]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Gender
                                        </label>

                                        <div className="flex h-[50px] items-center gap-6 rounded-xl border border-gray-300 px-4">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="1"
                                                />
                                                Male
                                            </label>

                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="2"
                                                />
                                                Female
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        className="flex-1 rounded-xl border border-[#296BE1] px-5 py-3 font-semibold text-[#296BE1] transition hover:bg-[#296BE1]/5"
                                    >
                                        Submit
                                    </button>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 rounded-xl bg-[#296BE1] px-5 py-3 font-semibold text-white transition hover:bg-[#2158bc]"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="flex h-full flex-col justify-center">
                                <h3 className="text-3xl font-bold">
                                    Membership Selection
                                </h3>

                                <p className="mt-3 text-gray-500">
                                    Display available gym plans here.
                                </p>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="rounded-xl border border-gray-300 px-6 py-3"
                                    >
                                        Back
                                    </button>

                                    <button className="rounded-xl bg-[#296BE1] px-6 py-3 text-white">
                                        Complete Registration
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}