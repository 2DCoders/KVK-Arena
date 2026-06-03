import { useState } from "react";
import gymImage from "@/assets/gym-signup.jpg";

interface SignupModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SignupModal({ open, onClose }: SignupModalProps) {
    const [step, setStep] = useState(1);
    const [gender, setGender] = useState<number | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [confirm, setConfirm] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
    });

    const [errors, setErrors] = useState<any>({});

    if (!open) return null;

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: any = {};

        if (!form.firstName.trim())
            newErrors.firstName = "First name is required";

        if (!form.lastName.trim())
            newErrors.lastName = "Last name is required";

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (form.phone.length < 7) {
            newErrors.phone = "Invalid phone number";
        }

        if (!form.dob) newErrors.dob = "Date of birth is required";

        if (!gender) newErrors.gender = "Please select gender";

        if (!confirm)
            newErrors.confirm =
                "You must confirm before continuing";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const isValid =
        form.firstName &&
        form.lastName &&
        form.email &&
        form.phone &&
        form.dob &&
        gender &&
        confirm;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">

            <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.25)]">

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-xl hover:bg-black/20"
                >
                    ×
                </button>

                <div className="grid min-h-[600px] md:grid-cols-[42%_58%]">

                    {/* LEFT PANEL */}
                    <div className="relative hidden md:block">
                        <img
                            src={gymImage}
                            alt="Gym"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-[#296BE1]/70" />

                        <div className="relative flex h-full flex-col justify-end p-10 text-white">
                            <div className="mb-5 inline-flex w-fit rounded-full bg-white/10 px-4 py-1 text-xs font-semibold backdrop-blur">
                                PREMIUM FITNESS CLUB
                            </div>

                            <h2 className="text-5xl font-black leading-tight">
                                Build Your <br /> Best Body
                            </h2>

                            <p className="mt-4 max-w-sm text-sm text-gray-200">
                                Join expert trainers, modern equipment,
                                and premium fitness programs.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 md:p-10">

                        {/* HEADER */}
                        <div className="mb-6">
                            <span className="inline-flex rounded-full bg-[#296BE1]/10 px-3 py-1 text-xs font-semibold text-[#296BE1]">
                                JOIN NOW
                            </span>

                            <h3 className="mt-3 text-3xl font-black text-slate-900">
                                Start Your Fitness Journey
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Register in minutes and choose your plan.
                            </p>
                        </div>

                        {/* STEP */}
                        <div className="mb-8 flex items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#296BE1] text-xs font-bold text-white">
                                    1
                                </div>
                                <span className="text-sm font-semibold">
                                    Registration
                                </span>
                            </div>

                            <div className="mx-4 h-[2px] flex-1 bg-slate-200" />

                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                        step === 2
                                            ? "bg-[#296BE1] text-white"
                                            : "border border-slate-300 text-slate-400"
                                    }`}
                                >
                                    2
                                </div>

                                <span
                                    className={
                                        step === 2
                                            ? "text-sm font-semibold"
                                            : "text-sm text-slate-400"
                                    }
                                >
                                    Membership
                                </span>
                            </div>
                        </div>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">

                                    {/* FIRST NAME */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            First Name
                                        </label>

                                        <input
                                            name="firstName"
                                            placeholder="Enter first name"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#296BE1] focus:ring-4 focus:ring-[#296BE1]/10"
                                        />

                                        {errors.firstName && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    {/* LAST NAME */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            Last Name
                                        </label>

                                        <input
                                            name="lastName"
                                            placeholder="Enter last name"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#296BE1] focus:ring-4 focus:ring-[#296BE1]/10"
                                        />

                                        {errors.lastName && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>

                                    {/* EMAIL */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            Email
                                        </label>

                                        <input
                                            name="email"
                                            placeholder="Enter email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#296BE1] focus:ring-4 focus:ring-[#296BE1]/10"
                                        />

                                        {errors.email && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* PHONE */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            Phone
                                        </label>

                                        <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                            <div className="flex items-center border-r border-slate-200 px-3 text-sm font-semibold">
                                                +94
                                            </div>

                                            <input
                                                name="phone"
                                                placeholder="XX XXX XXXX"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full px-3 text-sm outline-none"
                                            />
                                        </div>

                                        {errors.phone && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            DOB
                                        </label>

                                        <input
                                            type="date"
                                            name="dob"
                                            value={form.dob}
                                            onChange={handleChange}
                                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#296BE1] focus:ring-4 focus:ring-[#296BE1]/10"
                                        />

                                        {errors.dob && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.dob}
                                            </p>
                                        )}
                                    </div>

                                    {/* GENDER */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                                            Gender
                                        </label>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setGender(1)}
                                                className={`h-10 rounded-xl border cursor-pointer text-sm ${
                                                    gender === 1
                                                        ? "bg-[#296BE1] text-white border-[#296BE1]"
                                                        : "bg-white"
                                                }`}
                                            >
                                                Male
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setGender(2)}
                                                className={`h-10 rounded-xl border cursor-pointer text-sm ${
                                                    gender === 2
                                                        ? "bg-[#296BE1] text-white border-[#296BE1]"
                                                        : "bg-white"
                                                }`}
                                            >
                                                Female
                                            </button>
                                        </div>

                                        {errors.gender && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.gender}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* CONFIRM CHECKBOX */}
                                <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                                    <input
                                        type="checkbox"
                                        checked={confirm}
                                        onChange={() => setConfirm(!confirm)}
                                        className="mt-1 cursor-pointer"
                                    />

                                    <p className="text-xs text-slate-600">
                                        I confirm that all information is correct and understand this action cannot be undone.
                                    </p>
                                </div>

                                {/* BUTTON */}
                                <button
                                    onClick={() => {
                                        if (!validate()) return;
                                        setStep(2);
                                    }}
                                    disabled={!isValid}
                                    className={`mt-6 h-11 w-full rounded-xl text-sm font-semibold transition ${
                                        isValid
                                            ? "bg-[#296BE1] text-white shadow-lg shadow-[#296BE1]/20 hover:bg-[#2158bc] cursor-pointer"
                                            : "cursor-not-allowed bg-slate-200 text-slate-400"
                                    }`}
                                >
                                    Submit & Next
                                </button>
                            </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { name: "Monthly", price: "LKR 5,000" },
                                        { name: "Quarterly", price: "LKR 13,500" },
                                        { name: "Annual", price: "LKR 48,000" },
                                    ].map((plan) => (
                                        <button
                                            key={plan.name}
                                            onClick={() => setSelectedPlan(plan.name)}
                                            className={`rounded-2xl border p-5 text-left transition ${
                                                selectedPlan === plan.name
                                                    ? "border-[#296BE1] bg-[#296BE1]/5"
                                                    : "border-slate-200 bg-white"
                                            }`}
                                        >
                                            <h4 className="font-bold">
                                                {plan.name}
                                            </h4>
                                            <p className="mt-2 text-2xl font-black text-[#296BE1]">
                                                {plan.price}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold"
                                    >
                                        Back
                                    </button>

                                    <button className="h-11 flex-1 rounded-xl bg-[#296BE1] text-sm font-semibold text-white">
                                        Complete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}