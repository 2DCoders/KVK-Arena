import { useState, useEffect } from "react";
import gymImage from "@/assets/gym-signup.jpg";
import { getMembershipPlans } from "@/services/memberships-api";
import { registerMember } from "@/services/auth-api";
import Alert from "@/components/alert";

interface SignupModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SignupModal({ open, onClose }: SignupModalProps) {
    const [step, setStep] = useState(1);
    const [gender, setGender] = useState<number | null>(null);
    const [confirm, setConfirm] = useState(false);
    const [plans, setPlans] = useState<any[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [pageAlert, setPageAlert] = useState<{ visible: boolean; variant?: 'success' | 'error' | 'warning' | 'info'; title?: string; description?: string }>({ visible: false });
    const [loading, setLoading] = useState(false);

    const fetchMembershipPlans = async () => {
        try {
            const res = await getMembershipPlans()
            setPlans(res.additionalData.response)
        } catch (error) {
            console.error("Error fetching membership plans:", error)
        }
    }

    useEffect(() => {
        fetchMembershipPlans();
    }, []);

    useEffect(() => {
        if (plans.length > 0 && !selectedPlan) {
            const first = plans.find(p => p.isActive === 1);
            if (first) setSelectedPlan(first.id);
        }
    }, [plans]);

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

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const body = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                dateOfBirth: new Date(form.dob).toISOString(),
                memberType: 1,
                gender: gender,
                membershipPlanId: selectedPlan,
                deviceFingerprintId1: null,
                deviceFingerprintId2: null,
            };

            await registerMember(body);

            setPageAlert({
                visible: true,
                variant: 'success',
                title: 'Details Saved',
                description: 'The member details have been successfully saved.'
            });

            setStep(2);
        } catch (error: any) {
            setPageAlert({
                visible: true,
                variant: 'error',
                title: 'Registration Failed',
                description: error.response.data.message || 'An error occurred while registering the member. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-5000000000 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto">
            {pageAlert.visible && (
                <div>
                    <Alert variant={pageAlert.variant as any} title={pageAlert.title} description={pageAlert.description} onClose={() => setPageAlert((s) => ({ ...s, visible: false }))} />
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                        <p className="text-sm text-white font-medium">
                            Registering...
                        </p>
                    </div>
                </div>
            )}

            <div className="relative w-full max-w-6xl overflow-y-auto max-h-[95vh] md:overflow-hidden rounded-[32px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.25)]">

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-xl hover:bg-black/20"
                >
                    ×
                </button>

                <div className="grid md:grid-cols-[42%_58%]">

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
                    <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 md:p-10 max-h-[95vh] overflow-y-auto">

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
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step === 2
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
                                                className={`h-10 rounded-xl border cursor-pointer text-sm ${gender === 1
                                                    ? "bg-[#296BE1] text-white border-[#296BE1]"
                                                    : "bg-white"
                                                    }`}
                                            >
                                                Male
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setGender(2)}
                                                className={`h-10 rounded-xl border cursor-pointer text-sm ${gender === 2
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
                                    onClick={async () => {
                                        const ok = validate();
                                        if (!ok) return;

                                        await handleRegister();
                                    }}
                                    disabled={!isValid || loading}
                                    className={`mt-6 h-11 w-full rounded-xl text-sm font-semibold transition ${isValid && !loading
                                        ? "bg-[#296BE1] text-white shadow-lg shadow-[#296BE1]/20 hover:bg-[#2158bc] cursor-pointer"
                                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                                        }`}
                                >
                                    {loading ? "Processing..." : "Submit & Next"}
                                </button>
                            </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <>
                                {/* HEADER */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Choose Your Membership
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Select a plan to continue payment
                                    </p>
                                </div>

                                {/* PLAN CARDS */}
                                <div className="grid gap-3 md:grid-cols-2">
                                    {plans
                                        .filter((p) => p.isActive === 1)
                                        .map((plan) => {
                                            const isSelected = selectedPlan === plan.id;

                                            return (
                                                <button
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlan(plan.id)}
                                                    className={`text-left rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${isSelected
                                                        ? "border-[#296BE1] bg-[#296BE1]/5 shadow-lg"
                                                        : "border-slate-200 bg-white"
                                                        }`}
                                                >
                                                    {/* TITLE */}
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">
                                                                {plan.title}
                                                            </h4>

                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {plan.durationInDays === 1
                                                                    ? "1 Day"
                                                                    : plan.durationInDays === 30
                                                                        ? "1 Month"
                                                                        : plan.durationInDays === 90
                                                                            ? "3 Months"
                                                                            : plan.durationInDays === 365
                                                                                ? "1 Year"
                                                                                : `${plan.durationInDays} Days`}
                                                            </p>
                                                        </div>

                                                        <div className="text-[#296BE1] font-black text-lg">
                                                            LKR {plan.price}
                                                        </div>
                                                    </div>

                                                    {/* DESCRIPTION */}
                                                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                                                        {plan.description}
                                                    </p>

                                                    {/* FEATURES PREVIEW */}
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {plan.features
                                                            .split(",")
                                                            .slice(0, 3)
                                                            .map((f: string) => (
                                                                <span
                                                                    key={f}
                                                                    className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                                                                >
                                                                    {f.trim()}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>

                                {/* ACTIONS */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold"
                                    >
                                        Back
                                    </button>

                                    <button
                                        disabled={!selectedPlan}
                                        onClick={() => {
                                            if (!selectedPlan) return;

                                            // TODO: trigger payment or submit API here
                                            console.log("Selected Plan:", selectedPlan);

                                            setStep(3); // optional success step
                                        }}
                                        className={`h-11 flex-1 rounded-xl text-sm font-semibold transition ${selectedPlan
                                            ? "bg-[#296BE1] text-white hover:bg-[#2158bc]"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            }`}
                                    >
                                        Pay & Continue
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