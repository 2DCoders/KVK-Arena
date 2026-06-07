import Alert from "@/components/alert";
import { getEnv } from "@/env";
import { changePassword, getMember, updateMember } from "@/services/auth-api";
import { getMembershipPlans } from "@/services/memberships-api";
import { createPayment } from "@/services/pay-api";
import {
    X,
    Phone,
    Calendar,
    Crown,
    User,
    Fingerprint,
    DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
}

export default function UserProfileModal({
    open,
    onClose,
}: UserProfileModalProps) {
    if (!open) return null;

    const [memberData, setMemberData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: 1,
    });
    const [pageAlert, setPageAlert] = useState<{ visible: boolean; variant?: 'success' | 'error' | 'warning' | 'info'; title?: string; description?: string }>({ visible: false });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [plans, setPlans] = useState<any[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isPlanEnd, setIsPlanEnd] = useState(false);
    const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
    });

    const memberId = localStorage.getItem("memberId") || "N/A";
    const memberName = localStorage.getItem("memberName") || "N/A";
    const memberEmail = localStorage.getItem("memberEmail") || "N/A";
    const memberToken = localStorage.getItem("memberToken") || "";

    const fetchMembershipPlans = async () => {
        try {
            const res = await getMembershipPlans()
            setPlans(res.additionalData.response)
        } catch (error) {
            console.error("Error fetching membership plans:", error)
        }
    }

    const calculateEndDate = (baseDate: Date, days: number) => {
        const result = new Date(baseDate);
        result.setDate(result.getDate() + days);
        return result;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.payhere) {
                clearInterval(interval);

                window.payhere.onCompleted = (orderId: string) => {
                    console.log("Payment success:", orderId);
                };

                window.payhere.onDismissed = () => {
                    console.log("Payment cancelled");
                };

                window.payhere.onError = (error: any) => {
                    console.log("Payment error:", error);
                };
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        fetchMembershipPlans();
    }, []);

    const handleChangePassword = async () => {
        try {
            await changePassword(memberId, { newPassword: passwordForm.newPassword, oldPassword: passwordForm.oldPassword }, memberToken);
            setPageAlert({
                visible: true,
                variant: 'success',
                title: 'Success',
                description: 'Password changed successfully'
            });
        } catch (error) {
            console.error("Error changing password:", error);
            setPageAlert({
                visible: true,
                variant: 'error',
                title: 'Error',
                description: 'Failed to change password'
            });
        }
    }

    const handleInitPayment = async () => {
        try {
            const body = {
                amount: plans.find(p => p.id === selectedPlan)?.price ?? 0,
                memberId,
                membershipPlanId: selectedPlan,
            };

            const response = await createPayment(body);
            const payment = response;

            if (!window.payhere) {
                throw new Error("PayHere not loaded");
            }

            const paymentDetails = {
                sandbox: true,

                merchant_id: payment.merchantId,
                order_id: payment.orderId,
                currency: payment.currency,
                amount: payment.amount,
                hash: payment.hash,

                items: "Gym Membership",

                first_name: memberData?.firstName || "",
                last_name: memberData?.lastName || "",
                email: memberEmail,
                phone: memberData?.phoneNumber || "N/A",

                address: "N/A",
                city: "Colombo",
                country: "Sri Lanka",

                return_url: `${getEnv().BASE_URL}success`,
                cancel_url: `${getEnv().BASE_URL}cancel`,
                notify_url: `${getEnv().API_URL}payments/notify`,
            }

            window.payhere.startPayment(paymentDetails);

        } catch (error) {

            setPageAlert({
                visible: true,
                variant: "error",
                title: "Payment Failed",
                description: "Could not start PayHere payment",
            });
        }
    };

    const handleGetMember = async () => {
        try {
            const memberData = await getMember(memberId, memberToken);
            setMemberData(memberData?.additionalData?.response);
            if (memberData?.additionalData?.response?.memberPayment?.memberShipEndDate === null) {
                setIsPlanEnd(true);
            } else if (memberData?.additionalData?.response?.memberPayment?.memberShipEndDate > new Date().toISOString()) {
                setIsPlanEnd(false);
            } else {
                setIsPlanEnd(true);
            }
        } catch (error) {
            console.error("Error fetching member data:", error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("memberId");
        localStorage.removeItem("memberName");
        localStorage.removeItem("memberEmail");
        localStorage.removeItem("memberToken");
        window.location.reload();
    }

    const handleUpdateMember = async () => {
        try {
            await updateMember(memberId, form, memberToken);
            setPageAlert({
                visible: true,
                variant: 'success',
                title: 'Success',
                description: 'Member updated successfully'
            });
        } catch (error) {
            console.error("Error updating member:", error);
            setPageAlert({
                visible: true,
                variant: 'error',
                title: 'Error',
                description: 'Failed to update member'
            });
        } finally {
            setIsEditing(false);
            handleGetMember();
        }
    }

    useEffect(() => {
        handleGetMember();
    }, []);

    useEffect(() => {
        if (memberData) {
            setForm({
                firstName: memberData.firstName || "",
                lastName: memberData.lastName || "",
                email: memberData.email || "",
                phoneNumber: memberData.phoneNumber || "",
                gender: memberData.gender || 1,
            });
        }
    }, [memberData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="fixed inset-0 z-[9999]">

            {pageAlert.visible && (
                <div>
                    <Alert variant={pageAlert.variant as any} title={pageAlert.title} description={pageAlert.description} onClose={() => setPageAlert((s) => ({ ...s, visible: false }))} />
                </div>
            )}
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative h-screen overflow-y-auto">
                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 min-h-[350px]">
                    {/* Background Glow */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-blue-600/20 blur-[140px]" />
                    <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-blue-500/10 blur-[120px]" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="fixed cursor-pointer right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white backdrop-blur-lg transition hover:bg-white/20"
                    >
                        <X size={22} />
                    </button>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            {/* User Info */}
                            <div>
                                <div className="inline-flex items-center gap-2 ">
                                    <div className="flex items-center gap-2 text-blue-300 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                                        <Crown size={16} className="text-blue-300" />
                                        <span className="text-sm font-medium text-blue-200">
                                            {memberData?.membershipPlanTitle || "N/A"}
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="flex items-center cursor-pointer gap-2 text-blue-300 rounded-full border border-blue-400/20 bg-yellow-500/40 px-4 py-2 hover:bg-yellow-400/50 transition"
                                    >
                                        <span className="text-sm font-medium text-blue-200">
                                            Upgrade Plan
                                        </span>
                                    </div>
                                </div>

                                {showUpgradeModal && (
                                    <div className="fixed inset-0 z-[10000] flex items-center justify-center">

                                        {/* Backdrop */}
                                        <div
                                            className="absolute inset-0 bg-black/80"
                                            onClick={() => setShowUpgradeModal(false)}
                                        />

                                        {/* Modal */}
                                        <div className="relative w-[95%] md:w-[80%] lg:w-[60%] h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">

                                            {/* Header */}
                                            <div className="flex justify-between items-center p-6 border-b">
                                                <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>

                                                <button
                                                    onClick={() => setShowUpgradeModal(false)}
                                                    className="p-2 cursor-pointer rounded-full hover:bg-slate-100"
                                                >
                                                    <X />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 overflow-y-auto h-[calc(80vh-80px)]">

                                                <div className="w-full flex justify-between items-center rounded-2xl border border-blue-500/20 bg-white-900/60 backdrop-blur-md px-6 py-5 mb-6">
                                                    <div>
                                                        <p className="text-slate-600">
                                                            Choose a new membership plan below.
                                                        </p>
                                                        {selectedPlan && (
                                                            <div className="text-slate-600 text-sm mt-2">
                                                                <p>
                                                                    Start Date:{" "}
                                                                    <span className="font-semibold">
                                                                        {isPlanEnd || !memberData?.memberPayment?.memberShipEndDate
                                                                            ? new Date().toLocaleDateString()
                                                                            : new Date(memberData.memberPayment.memberShipEndDate).toLocaleDateString()}
                                                                    </span>
                                                                </p>

                                                                <p>
                                                                    End Date:{" "}
                                                                    <span className="font-semibold text-blue-600">
                                                                        {calculatedEndDate
                                                                            ? new Date(calculatedEndDate).toLocaleDateString()
                                                                            : "-"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>


                                                    <div>
                                                        <button
                                                            onClick={() => setSelectedPlan(null)}
                                                            disabled={selectedPlan === null}
                                                            className={`group relative cursor-pointer w-full text-left rounded-2xl p-4 transition-all duration-300
                                                                ${selectedPlan === null
                                                                    ? "bg-white border cursor-not-allowed border-slate-200"
                                                                    : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <h4 onClick={handleInitPayment} className={`font-semibold ${selectedPlan !== null ? "text-white" : "text-slate-900"}`}>
                                                                    Pay Now
                                                                </h4>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>


                                                <div className="grid gap-3 md:grid-cols-2 mt-6">
                                                    {plans
                                                        .filter((p) => p.isActive === 1)
                                                        .map((plan) => {
                                                            const isSelected = selectedPlan === plan.id;

                                                            return (
                                                                <button
                                                                    key={plan.id}
                                                                    onClick={() => {
                                                                        setSelectedPlan(plan.id);

                                                                        const baseDate =
                                                                            isPlanEnd || !memberData?.memberPayment?.memberShipEndDate
                                                                                ? new Date()
                                                                                : new Date(memberData.memberPayment.memberShipEndDate);

                                                                        const newEnd = calculateEndDate(baseDate, plan.durationInDays);

                                                                        setCalculatedEndDate(newEnd.toISOString());
                                                                    }}
                                                                    className={`text-left cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${isSelected
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
                                                                            LKR {Number(plan.price).toLocaleString("en-LK", {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2,
                                                                            })}
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
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <h1 className="mt-5 text-4xl md:text-6xl font-bold text-white">
                                    {memberData?.firstName + " " + memberData?.lastName || memberName}
                                </h1>

                                <p className="mt-3 max-w-xl text-slate-300">
                                    Start Date : {memberData?.memberPayment?.memberShipStartDate ? new Date(memberData.memberPayment.memberShipStartDate).toLocaleDateString() : "Not Yet"}
                                </p>

                                <p className="mt-3 max-w-xl text-slate-300">
                                    End Date : {memberData?.memberPayment?.memberShipEndDate ? new Date(memberData.memberPayment.memberShipEndDate).toLocaleDateString() : "Not Yet"}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-4 text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
                                        Member Since {memberData?.createdDate ? new Date(memberData.createdDate).toLocaleDateString() : "Not Started Yet"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone size={18} />
                                        {memberData?.phoneNumber || "Not provided"}
                                    </div>
                                </div>
                            </div>

                            {/* Membership Summary */}
                            <div className="flex flex-col justify-center lg:items-end">

                                <div className="flex flex-wrap gap-4">

                                    {/* Membership */}
                                    <div className="rounded-2xl border border-blue-500/20 bg-slate-900/60 backdrop-blur-md px-6 py-5 min-w-[260px]">

                                        {/* Title */}
                                        <p className="text-xs uppercase tracking-widest text-slate-400">
                                            Membership Plan
                                        </p>

                                        {/* Plan */}
                                        <div className="mt-2 flex items-center gap-3">
                                            <Crown size={22} className="text-yellow-400" />

                                            <span className="text-2xl font-bold text-white">
                                                {memberData?.membershipPlanTitle || "N/A"}
                                            </span>
                                        </div>

                                        {/* Status Section */}
                                        <div className="mt-4 space-y-2">

                                            {/* Membership Status */}
                                            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <User size={16} className="text-blue-400" />
                                                    <span className="text-sm">
                                                        Membership
                                                    </span>
                                                </div>

                                                <span className={`text-sm font-semibold ${memberData?.membershipStatus === "Active" ? "text-green-400" : "text-red-400"} flex items-center gap-2`}>
                                                    {memberData?.membershipStatus}
                                                </span>
                                            </div>

                                            {/* Fingerprints Status */}
                                            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Fingerprint size={16} className="text-blue-400" />
                                                    <span className="text-sm">
                                                        Fingerprints
                                                    </span>
                                                </div>

                                                <span className={`text-sm font-semibold ${memberData?.isSavedFingerprints ? "text-green-400" : "text-red-400"}`}>
                                                    {memberData?.isSavedFingerprints ? "Enrolled" : "Not Yet"}
                                                </span>
                                            </div>

                                            {/* Payment Status */}
                                            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <DollarSign size={16} className="text-blue-400" />
                                                    <span className="text-sm">
                                                        Payment
                                                    </span>
                                                </div>

                                                <span className={`text-sm font-semibold ${memberData?.memberPayment?.paymentStatus === 1 ? "text-red-400" : "text-green-400"}`}>
                                                    {memberData?.memberPayment?.paymentStatus === 1 ? "Unpaid" : "Paid"}
                                                </span>
                                            </div>


                                        </div>

                                    </div>
                                    {/* Reward Points */}
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 min-w-[260px] shadow-2xl shadow-blue-900/40">

                                        {/* Glow */}
                                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

                                        <div className="relative">
                                            <p className="text-xs uppercase tracking-widest text-blue-100/80">
                                                Reward Points
                                            </p>

                                            <div className="mt-2 flex items-end gap-2">
                                                <span className="text-5xl font-black text-white">
                                                    {memberData?.rewardPoints || 0}
                                                </span>

                                                <span className="mb-2 text-blue-100">
                                                    pts
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm text-blue-100">
                                                    Available Balance
                                                </span>

                                                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
                                                    Rs. {memberData?.availableBalance?.toLocaleString() || "0"}
                                                </span>
                                            </div>

                                            <div className="mt-3 text-xs text-blue-100/90">
                                                1 Point = Rs. 1.00
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="bg-slate-100 min-h-[calc(100vh-350px)]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

                        <div className="grid lg:grid-cols-3 gap-8">

                            {/* LEFT */}
                            <div className="space-y-6">

                                {/* CONTACT */}
                                <div className="bg-white rounded-3xl p-6 shadow-xl border">

                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-xl font-bold">Personal Information</h3>
                                    </div>

                                    <div className="space-y-4">

                                        {/* First Name */}
                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                                            placeholder="First Name"
                                        />

                                        {/* Last Name */}
                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                                            placeholder="Last Name"
                                        />

                                        {/* Email */}
                                        <input
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                                            placeholder="Email"
                                        />

                                        {/* Phone */}
                                        <input
                                            name="phoneNumber"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                                            placeholder="Phone Number"
                                        />

                                        {/* Gender */}
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                                        >
                                            <option value={1}>Male</option>
                                            <option value={2}>Female</option>
                                        </select>

                                        {/* Update Button */}
                                        {isEditing && (
                                            <button
                                                disabled={!isEditing || !form.firstName || !form.lastName || !form.email || !form.phoneNumber}
                                                className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                                                onClick={() => {
                                                    handleUpdateMember();
                                                }}
                                            >
                                                Update Profile
                                            </button>
                                        )}
                                    </div>
                                </div>


                                {/* PASSWORD + LOGOUT */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl border">

                                    <h3 className="text-2xl font-bold mb-6">
                                        Account Security
                                    </h3>

                                    <div className="space-y-4">

                                        <input
                                            className="w-full p-3 rounded-xl bg-slate-100"
                                            value={memberEmail}
                                            readOnly
                                        />

                                        <input
                                            type="password"
                                            value={passwordForm.oldPassword}
                                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
                                            placeholder="Current Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="New Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Confirm Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <button
                                            disabled={
                                                !passwordForm.oldPassword ||
                                                !passwordForm.newPassword ||
                                                !passwordForm.confirmPassword
                                            }
                                            onClick={handleChangePassword}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all ${!passwordForm.oldPassword ||
                                                    !passwordForm.newPassword ||
                                                    !passwordForm.confirmPassword
                                                    ? "bg-blue-600 text-white opacity-50 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                                }`}
                                        >
                                            Change Password
                                        </button>

                                        <button onClick={handleLogout} className="w-full mt-4 cursor-pointer bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600">
                                            Logout
                                        </button>

                                    </div>
                                </div>

                            </div>

                            {/* RIGHT */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* ATTENDANCE */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl border">
                                    <div className="flex justify-between mb-6">
                                        <h3 className="text-2xl font-bold">Attendance Report</h3>
                                        <span className="text-slate-500">This Month</span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Present", value: "18" },
                                            { label: "Missed", value: "4" },
                                            { label: "Streak", value: "6 Days" },
                                            { label: "Rate", value: "82%" },
                                        ].map((i) => (
                                            <div key={i.label} className="bg-slate-50 p-4 rounded-xl">
                                                <p className="text-sm text-slate-500">{i.label}</p>
                                                <p className="text-xl font-bold">{i.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>



                                {/* BENEFITS */}
                                <div className="bg-white rounded-3xl p-6 shadow-xl border">
                                    <h3 className="text-xl font-bold mb-4">
                                        Membership Benefits
                                    </h3>

                                    {memberData?.membershipPlan?.features?.split(',').map((b: any) => (
                                        <div key={b} className="p-3 bg-slate-50 rounded-xl mb-2">
                                            {b}
                                        </div>
                                    ))}
                                </div>

                                {/* TRAINER */}

                                {memberData?.assignedTrainer !== null ? (
                                    <div className="bg-white rounded-3xl p-6 shadow-xl border">
                                        <h3 className="text-xl font-bold mb-5">Personal Trainer</h3>

                                        <div className="flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                                <User />
                                            </div>

                                            <div>
                                                <h4 className="font-semibold">{memberData?.trainerName || ""}</h4>
                                                <p className="text-sm text-slate-500">Trainer</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-6 shadow-xl border">
                                        <h3 className="text-xl font-bold mb-5">Personal Trainer</h3>

                                        <div className="flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-slate-300 rounded-2xl flex items-center justify-center text-white">
                                                <User />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-500">No Trainer Assigned</h4>
                                                <p className="text-sm text-slate-400">Please contact support to assign a trainer.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}