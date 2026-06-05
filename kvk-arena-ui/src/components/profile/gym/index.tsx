import Alert from "@/components/alert";
import { getMember, updateMember } from "@/services/auth-api";
import {
    X,
    Mail,
    Phone,
    MapPin,
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


    const memberId = localStorage.getItem("memberId") || "N/A";
    const memberName = localStorage.getItem("memberName") || "N/A";
    const memberEmail = localStorage.getItem("memberEmail") || "N/A";
    const memberToken = localStorage.getItem("memberToken") || "";

    const handleGetMember = async () => {
        try {
            const memberData = await getMember(memberId, memberToken);
            setMemberData(memberData?.additionalData?.response);
            console.log("Member Data:", memberData?.additionalData?.response);
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
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                                    <Crown size={16} className="text-blue-300" />
                                    <span className="text-sm font-medium text-blue-200">
                                        {memberData?.membershipPlanTitle || "N/A"}
                                    </span>
                                </div>

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
                                            placeholder="Current Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="w-full p-3 rounded-xl border"
                                        />

                                        <button className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
                                            Update Password
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

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}