import Alert from "@/components/alert";
import { getEnv } from "@/env";
import { changePassword, getMember, updateMember } from "@/services/auth-api";
import { getMembershipPlans } from "@/services/memberships-api";
import { createPayment } from "@/services/pay-api";
import {
  createRequest,
  getRequestById,
  updateRequest,
} from "@/services/trainers-api";
import {
  X,
  Calendar,
  Crown,
  DollarSign,
  User,
  Star,
  Award,
  Pencil,
  Fingerprint,
  Phone,
  Briefcase,
  Plus,
  Camera,
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
  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({ visible: false });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPlanEnd, setIsPlanEnd] = useState(false);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(
    null,
  );
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    oldPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);
  const [isExistRequest, setIsExistRequest] = useState(false);
  const [pendingRequestData, setPendingRequestData] = useState<any>(null);
  const [isViewingPendingRequest, setIsViewingPendingRequest] = useState(false);
  const [trainerForm, setTrainerForm] = useState<{
    email: string;
    phoneNumber: string;
    specialization: string;
    yearsOfExperience: number;
    rating: number;
    firstName: string;
    lastName: string;
    gender: number;
    trainerId: string;
    profilePicture: string | File;
    role: string;
    isFreelance: boolean;
  }>({
    email: "",
    phoneNumber: "",
    specialization: "",
    yearsOfExperience: 0,
    rating: 0,
    firstName: "",
    lastName: "",
    gender: 1,
    trainerId: "",
    profilePicture: "",
    role: "",
    isFreelance: false,
  });

  const memberId = localStorage.getItem("memberId") || "N/A";
  const memberName = localStorage.getItem("memberName") || "N/A";
  const memberEmail = localStorage.getItem("memberEmail") || "N/A";
  // Ensure memberToken is always a string, default to empty string if null/undefined
  const memberToken = localStorage.getItem("memberToken") || "";
  const memberType = localStorage.getItem("memberType") || "N/A";

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchMembershipPlans = async () => {
    try {
      const res = await getMembershipPlans();
      setPlans(res.additionalData.response);
    } catch (error) {
      console.error("Error fetching membership plans:", error);
    }
  };

  const calculateEndDate = (baseDate: Date, days: number) => {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleEditTrainer = () => {
    setTrainerForm({
      email: memberData?.email || "",
      phoneNumber: memberData?.phoneNumber || "",
      specialization: memberData?.specialization || "",
      yearsOfExperience: memberData?.yearsOfExperience || 0,
      rating: memberData?.rating || 0,
      firstName: memberData?.firstName || "",
      lastName: memberData?.lastName || "",
      gender: memberData?.gender || 1,
      trainerId: memberData?.id,
      profilePicture: memberData?.profilePicture || "",
      role: memberData?.role || "",
      isFreelance: memberData?.isFreelance || false,
      // Not a pending request
    });

    setShowEditTrainerModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setPageAlert({
          visible: true,
          variant: "warning",
          title: "Invalid File Type",
          description: "Only PNG, JPG, and JPEG files are allowed.",
        });
        return;
      }
      setTrainerForm((prev) => ({ ...prev, profilePicture: file }));
    }
  };

  const handleViewPendingRequest = () => {
    setIsViewingPendingRequest(true); // This is a pending request
    if (pendingRequestData) {
      setTrainerForm({
        ...pendingRequestData, // Populate with pending request data
        profilePicture: pendingRequestData.profilePicture || "", // Ensure profilePicture is handled
      });
    }
    setShowEditTrainerModal(true);
  };

  const handleGetRequestById = async () => {
    try {
      const data = await getRequestById(memberId, memberToken);
      console.log("Trainer Request Data:", data);
      setPendingRequestData(data?.additionalData?.response || null);
      setIsExistRequest(true);
    } catch (error) {
      setPendingRequestData(null);
      setIsExistRequest(false);
    }
  };

  useEffect(() => {
    setIsExistRequest(!!pendingRequestData);
  }, [pendingRequestData]);

  const handleUpdateTrainer = async () => {
    const formdata = new FormData();
    formdata.append("UserName", trainerForm.email);
    formdata.append("FirstName", trainerForm.firstName);
    formdata.append("LastName", trainerForm.lastName);
    formdata.append("Email", trainerForm.email);
    formdata.append("PhoneNumber", trainerForm.phoneNumber);
    formdata.append("Specialization", trainerForm.specialization);
    formdata.append("YearsOfExperience", String(trainerForm.yearsOfExperience));
    formdata.append("Role", trainerForm.role);
    formdata.append("IsFreelance", String(trainerForm.isFreelance));

    if (trainerForm.profilePicture instanceof File) {
      formdata.append("ProfilePicture", trainerForm.profilePicture);
    }

    setLoading(true);

    if (isViewingPendingRequest) {
      try {
        await updateRequest(memberId, formdata, memberToken);

        setPageAlert({
          visible: true,
          variant: "success",
          title: "Success",
          description: "Pending request updated successfully.",
        });
        setShowEditTrainerModal(false);
        handleGetMember();
        handleGetRequestById();
      } catch (error) {
        setPageAlert({
          visible: true,
          variant: "error",
          title: "Error",
          description: "Failed to update profile update request.",
        });
      } finally {
        setIsViewingPendingRequest(false);
        setLoading(false);
      }
    } else {
      try {
        formdata.append("Id", memberId);
        await createRequest(formdata, memberToken);

        setPageAlert({
          visible: true,
          variant: "success",
          title: "Success",
          description:
            "Profile update request sent successfully. Please wait for admin approval.",
        });
        setShowEditTrainerModal(false);
        handleGetMember();
        handleGetRequestById();
      } catch (error) {
        setPageAlert({
          visible: true,
          variant: "error",
          title: "Error",
          description: "Failed to send profile update request.",
        });
      } finally {
        setLoading(false);
      }
    }
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
    handleGetRequestById();
  }, [memberId, memberToken]); // Add memberId and memberToken as dependencies

  const handleChangePassword = async () => {
    try {
      await changePassword(
        memberId,
        {
          newPassword: passwordForm.newPassword,
          oldPassword: passwordForm.oldPassword,
        },
        memberToken,
      );
      setPageAlert({
        visible: true,
        variant: "success",
        title: "Success",
        description: "Password changed successfully",
      });
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      }); // Clear form fields after successful change
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPageAlert({
        visible: true,
        variant: "error",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
      });
    }
  };

  const specializations =
    memberData?.specialization
      ?.split(",")
      .map((item: string) => item.trim())
      .filter(Boolean) || [];

  const handleInitPayment = async () => {
    try {
      const body = {
        amount: plans.find((p) => p.id === selectedPlan)?.price ?? 0,
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
      };

      window.payhere.startPayment(paymentDetails);
      setShowUpgradeModal(false);
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
    setLoading(true);
    try {
      const memberData = await getMember(memberId, memberToken);
      setMemberData(memberData);
      if (
        memberData?.additionalData?.response?.memberPayment
          ?.memberShipEndDate === null
      ) {
        setIsPlanEnd(true);
      } else if (
        memberData?.additionalData?.response?.memberPayment?.memberShipEndDate >
        new Date().toISOString()
      ) {
        setIsPlanEnd(false);
      } else {
        setIsPlanEnd(true);
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    localStorage.removeItem("memberEmail");
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberType"); // Also remove memberType
    window.location.reload();
  };

  const handleUpdateMember = async () => {
    try {
      await updateMember(memberId, form, memberToken);
      setPageAlert({
        visible: true,
        variant: "success",
        title: "Success",
        description: "Member updated successfully",
      });
    } catch (error) {
      console.error("Error updating member:", error);
      setPageAlert({
        visible: true,
        variant: "error",
        title: "Error",
        description: "Failed to update member",
      });
    } finally {
      setIsEditing(false);
      handleGetMember();
    }
  };

  useEffect(() => {
    handleGetMember();
  }, [memberId, memberToken]); // Add memberId and memberToken as dependencies

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

  return (
    <div className="fixed inset-0 z-[9999]">
      {pageAlert.visible && (
        <div>
          <Alert
            variant={pageAlert.variant as any}
            title={pageAlert.title}
            description={pageAlert.description}
            onClose={() => setPageAlert((s) => ({ ...s, visible: false }))}
          />
        </div>
      )}
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {loading && (
        <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
            <p className="text-sm text-white font-medium">Loading</p>
          </div>
        </div>
      )}

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
                          {isPlanEnd ||
                          !memberData?.memberPayment?.memberShipEndDate
                            ? new Date().toLocaleDateString()
                            : new Date(
                                memberData.memberPayment.memberShipEndDate,
                              ).toLocaleDateString()}
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
                    onClick={handleInitPayment} // This button should trigger payment
                    disabled={selectedPlan === null}
                    className={`group relative cursor-pointer w-full text-left rounded-2xl p-4 transition-all duration-300
                                                                ${
                                                                  selectedPlan ===
                                                                  null
                                                                    ? "bg-white border cursor-not-allowed border-slate-200"
                                                                    : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                                                                }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-semibold ${selectedPlan !== null ? "text-white" : "text-slate-900"}`}
                      >
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
                            isPlanEnd ||
                            !memberData?.memberPayment?.memberShipEndDate
                              ? new Date()
                              : new Date(
                                  memberData.memberPayment.memberShipEndDate,
                                );

                          const newEnd = calculateEndDate(
                            baseDate,
                            plan.durationInDays,
                          );

                          setCalculatedEndDate(newEnd.toISOString());
                        }}
                        className={`text-left cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                          isSelected
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
                            LKR{" "}
                            {Number(plan.price).toLocaleString("en-LK", {
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

      {/* Modal */}

      {memberType === "1" ? (
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

                  <h1 className="mt-5 text-4xl md:text-6xl font-bold text-white">
                    {memberData?.firstName + " " + memberData?.lastName ||
                      memberName}
                  </h1>

                  <p className="mt-3 max-w-xl text-slate-300">
                    Start Date :{" "}
                    {memberData?.memberPayment?.memberShipStartDate
                      ? new Date(
                          memberData.memberPayment.memberShipStartDate,
                        ).toLocaleDateString()
                      : "Not Yet"}
                  </p>

                  <p className="mt-3 max-w-xl text-slate-300">
                    End Date :{" "}
                    {memberData?.memberPayment?.memberShipEndDate
                      ? new Date(
                          memberData.memberPayment.memberShipEndDate,
                        ).toLocaleDateString()
                      : "Not Yet"}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      Member Since{" "}
                      {memberData?.createdDate
                        ? new Date(memberData.createdDate).toLocaleDateString()
                        : "Not Started Yet"}
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
                            <span className="text-sm">Membership</span>
                          </div>

                          <span
                            className={`text-sm font-semibold ${memberData?.membershipStatus === "Active" ? "text-green-400" : "text-red-400"} flex items-center gap-2`}
                          >
                            {memberData?.membershipStatus}
                          </span>
                        </div>

                        {/* Fingerprints Status */}
                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Fingerprint size={16} className="text-blue-400" />
                            <span className="text-sm">Fingerprints</span>
                          </div>

                          <span
                            className={`text-sm font-semibold ${memberData?.isSavedFingerprints ? "text-green-400" : "text-red-400"}`}
                          >
                            {memberData?.isSavedFingerprints
                              ? "Enrolled"
                              : "Not Yet"}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                          <div className="flex items-center gap-2 text-slate-300">
                            <DollarSign size={16} className="text-blue-400" />
                            <span className="text-sm">Payment</span>
                          </div>

                          <span
                            className={`text-sm font-semibold ${memberData?.memberPayment?.paymentStatus === 1 ? "text-red-400" : "text-green-400"}`}
                          >
                            {memberData?.memberPayment?.paymentStatus === 1
                              ? "Unpaid"
                              : "Paid"}
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

                          <span className="mb-2 text-blue-100">pts</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-blue-100">
                            Available Balance
                          </span>

                          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
                            Rs.{" "}
                            {memberData?.availableBalance?.toLocaleString() ||
                              "0"}
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
                      <h3 className="text-xl font-bold">
                        Personal Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* First Name */}
                      <input
                        name="firstName"
                        value={form.firstName}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                        placeholder="First Name"
                      />

                      {/* Last Name */}
                      <input
                        name="lastName"
                        value={form.lastName}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                        placeholder="Last Name"
                      />

                      {/* Email */}
                      <input
                        name="email"
                        value={form.email}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                        placeholder="Email"
                      />

                      {/* Phone */}
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                        placeholder="Phone Number"
                      />

                      {/* Gender */}
                      <select
                        name="gender"
                        value={form.gender}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-xl border bg-slate-50 disabled:bg-slate-100"
                      >
                        <option value={1}>Male</option>
                        <option value={2}>Female</option>
                      </select>

                      {/* Update Button */}
                      {isEditing && (
                        <button
                          disabled={
                            !isEditing ||
                            !form.firstName ||
                            !form.lastName ||
                            !form.email ||
                            !form.phoneNumber
                          }
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
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            oldPassword: e.target.value,
                          }))
                        }
                        placeholder="Current Password"
                        className="w-full p-3 rounded-xl border"
                      />

                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="New Password"
                        className="w-full p-3 rounded-xl border"
                      />

                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
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
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          !passwordForm.oldPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                            ? "bg-blue-600 text-white opacity-50 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        }`}
                      >
                        Change Password
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full mt-4 cursor-pointer bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-2 space-y-8">
                  {/* ATTENDANCE */}
                  {/* <div className="bg-white rounded-3xl p-8 shadow-xl border">
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
                        <div
                          key={i.label}
                          className="bg-slate-50 p-4 rounded-xl"
                        >
                          <p className="text-sm text-slate-500">{i.label}</p>
                          <p className="text-xl font-bold">{i.value}</p>
                        </div>
                      ))}
                    </div>
                  </div> */}

                  {/* BENEFITS */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border">
                    <h3 className="text-xl font-bold mb-4">
                      Membership Benefits
                    </h3>

                    {memberData?.membershipPlan?.features
                      ?.split(",")
                      .map((b: any) => (
                        <div
                          key={b}
                          className="p-3 bg-slate-50 rounded-xl mb-2"
                        >
                          {b}
                        </div>
                      ))}
                  </div>

                  {/* TRAINER */}

                  {memberData?.assignedTrainer !== null ? (
                    <div className="bg-white rounded-3xl p-6 shadow-xl border">
                      <h3 className="text-xl font-bold mb-5">
                        Personal Trainer
                      </h3>

                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                          <User />
                        </div>

                        <div>
                          <h4 className="font-semibold">
                            {memberData?.trainerName || ""}
                          </h4>
                          <p className="text-sm text-slate-500">Trainer</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-6 shadow-xl border">
                      <h3 className="text-xl font-bold mb-5">
                        Personal Trainer
                      </h3>

                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-slate-300 rounded-2xl flex items-center justify-center text-white">
                          <User />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-500">
                            No Trainer Assigned
                          </h4>
                          <p className="text-sm text-slate-400">
                            Please contact support to assign a trainer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-screen overflow-y-auto">
          {/* HERO */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="
      fixed
      right-6
      top-6
      z-50
      flex
      h-11
      w-11
      items-center
      justify-center
      rounded-full
      bg-white/10
      backdrop-blur-xl
      border
      border-white/10
      text-white
      hover:bg-white/20
      transition-all
      duration-300
      cursor-pointer
    "
            >
              <X size={20} />
            </button>

            <div className="relative max-w-7xl mx-auto px-6 py-8 lg:py-10">
              <div
                className="
        rounded-[32px]
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6 lg:p-8
      "
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  {/* LEFT */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Profile */}
                    <div
                      className="
              relative
              h-24
              w-24
              rounded-2xl
              overflow-hidden
              border
              border-white/10
              bg-white/10
              shadow-2xl
            "
                    >
                      {memberData?.profilePicture ? (
                        <img
                          src={
                            trainerForm.profilePicture instanceof File
                              ? URL.createObjectURL(memberData?.profilePicture)
                              : `data:image/jpeg;base64,${memberData?.profilePicture}`
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <User size={40} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-black text-white">
                        {memberData?.firstName + " " + memberData?.lastName ||
                          memberName}
                      </h1>

                      <p className="mt-1 text-slate-400 font-medium">
                        {memberData?.role || "Trainer"}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span
                          className="
                  px-3 py-1.5
                  rounded-full
                  bg-amber-500/10
                  border border-amber-500/20
                  text-amber-300
                  text-xs font-semibold
                "
                        >
                          💼 {memberData?.role || "Trainer"}
                        </span>

                        <span
                          className={`
                  px-3 py-1.5
                  rounded-full
                  text-xs
                  font-semibold
                  border
                  ${
                    memberData?.isFreelance
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-sky-500/10 border-sky-500/20 text-sky-300"
                  }
                `}
                        >
                          {memberData?.isFreelance
                            ? "🚀 Freelance Trainer"
                            : "🏢 Staff Trainer"}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-5 mt-5">
                        <div
                          className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                "
                        >
                          <Star
                            size={16}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="text-white font-semibold">
                            {memberData?.rating || 0}
                          </span>
                          <span className="text-slate-400 text-sm">Rating</span>
                        </div>

                        <div
                          className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                "
                        >
                          <Award size={16} className="text-orange-400" />

                          <span className="text-white font-semibold">
                            {memberData?.yearsOfExperience || 0}
                          </span>

                          <span className="text-slate-400 text-sm">
                            Years Experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isExistRequest ? (
                      <button
                        onClick={handleEditTrainer}
                        className="
                group
                cursor-pointer
                flex items-center gap-2
                px-6 py-3
                rounded-2xl
                bg-white
                text-slate-900
                font-semibold
                shadow-lg
                hover:shadow-xl
                hover:-translate-y-0.5
                transition-all
                duration-300
              "
                      >
                        <Pencil
                          size={18}
                          className="group-hover:rotate-12 transition-transform"
                        />
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleViewPendingRequest}
                        className="
                group
                cursor-pointer
                flex items-center gap-3
                px-6 py-3
                rounded-2xl
                bg-gradient-to-r
                from-amber-500
                via-amber-600
                to-orange-700
                text-white
                font-semibold
                shadow-lg shadow-orange-500/30
                hover:shadow-xl hover:shadow-orange-500/40
                hover:-translate-y-0.5
                transition-all duration-300
              "
                      >
                        <Pencil
                          size={18}
                          className="
                  transition-transform
                  duration-300
                  group-hover:rotate-12
                "
                        />
                        Pending Requests
                      </button>
                    )}
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
                  <div
                    className="
    rounded-[28px]
    bg-white
    border border-slate-200
    shadow-sm
    overflow-hidden
  "
                  >
                    <div className="px-8 py-6 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900">
                        Trainer Profile
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Personal information
                      </p>
                    </div>

                    <div className="p-8">
                      <div>
                        <label className="text-sm text-slate-500">
                          First Name
                        </label>
                        <input
                          value={form.firstName}
                          disabled={!isEditing}
                          className="w-full mt-2 p-3 rounded-xl border"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-500">
                          Last Name
                        </label>
                        <input
                          value={form.lastName}
                          disabled={!isEditing}
                          className="w-full mt-2 p-3 rounded-xl border"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-500">Email</label>
                        <input
                          value={form.email}
                          disabled={!isEditing}
                          className="w-full mt-2 p-3 rounded-xl border"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-500">Phone</label>
                        <input
                          value={form.phoneNumber}
                          disabled={!isEditing}
                          className="w-full mt-2 p-3 rounded-xl border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD + LOGOUT */}
                  <div className="bg-white rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">Account Security</h3>

                    <div className="space-y-4">
                      <input
                        className="w-full p-3 rounded-xl bg-slate-100"
                        value={memberEmail}
                        readOnly
                      />

                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            oldPassword: e.target.value,
                          }))
                        }
                        placeholder="Current Password"
                        className="w-full p-3 rounded-xl border"
                      />

                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="New Password"
                        className="w-full p-3 rounded-xl border"
                      />

                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
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
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          !passwordForm.oldPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                            ? "bg-blue-600 text-white opacity-50 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        }`}
                      >
                        Change Password
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full mt-4 cursor-pointer bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Bento Dashboard */}
                  <div className="grid lg:grid-cols-3 gap-5">
                    {/* Rating */}
                    <div
                      className="
      group
      relative
      overflow-hidden
      rounded-[28px]
      border border-slate-200
      bg-white
      p-6
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Trainer Rating
                          </p>

                          <h2 className="mt-3 text-4xl font-black text-slate-900">
                            {memberData?.rating || 0}
                          </h2>

                          <p className="mt-2 text-sm text-amber-600 font-medium">
                            Excellent Performance
                          </p>
                        </div>

                        <div
                          className="
          h-14 w-14
          rounded-2xl
          bg-amber-50
          text-amber-600
          flex items-center justify-center
          group-hover:scale-110
          transition-transform
        "
                        >
                          <Star size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div
                      className="
      group
      relative
      overflow-hidden
      rounded-[28px]
      border border-slate-200
      bg-white
      p-6
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Experience
                          </p>

                          <h2 className="mt-3 text-4xl font-black text-slate-900">
                            {memberData?.yearsOfExperience || 0}
                          </h2>

                          <p className="mt-2 text-sm text-emerald-600 font-medium">
                            Years in Industry
                          </p>
                        </div>

                        <div
                          className="
          h-14 w-14
          rounded-2xl
          bg-emerald-50
          text-emerald-600
          flex items-center justify-center
          group-hover:scale-110
          transition-transform
        "
                        >
                          <Briefcase size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Biometric */}
                    <div
                      className="
      group
      relative
      overflow-hidden
      rounded-[28px]
      border border-slate-200
      bg-white
      p-6
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Biometric Access
                          </p>

                          <h2 className="mt-3 text-2xl font-black text-slate-900">
                            {memberData?.isSavedFingerprints
                              ? "Enrolled"
                              : "Pending"}
                          </h2>

                          <div className="mt-3">
                            <span
                              className={`
              px-3 py-1
              rounded-full
              text-xs
              font-semibold
              ${
                memberData?.isSavedFingerprints
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }
            `}
                            >
                              {memberData?.isSavedFingerprints
                                ? "Active"
                                : "Action Required"}
                            </span>
                          </div>
                        </div>

                        <div
                          className="
                          h-14 w-14
                          rounded-2xl
                          bg-blue-50
                          text-blue-600
                          flex items-center justify-center
                          group-hover:scale-110
                          transition-transform
                        "
                        >
                          <Fingerprint size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="
    relative
    overflow-hidden
    rounded-[32px]
    border border-slate-200
    bg-white
    p-8
    shadow-[0_10px_40px_rgba(0,0,0,0.06)]
  "
                  >
                    {/* Soft Accent */}
                    <div className="absolute top-0 left-0 h-1.5 w-full" />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <span
                            className="
            inline-flex
            items-center
            rounded-full
            bg-amber-50
            px-3 py-1
            text-xs
            font-semibold
            text-amber-700
          "
                          >
                            Active Membership
                          </span>

                          <h2 className="mt-4 text-3xl font-black text-slate-900">
                            {memberData?.membershipPlanTitle}
                          </h2>

                          <p className="mt-1 text-slate-500">
                            Premium Trainer Membership
                          </p>
                        </div>

                        <div
                          className="
          flex items-center gap-2
          rounded-full
          bg-emerald-50
          px-4 py-2
          text-sm
          font-semibold
          text-emerald-700
          border border-emerald-100
          w-fit
        "
                        >
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </div>
                      </div>

                      {/* Membership Stats */}
                      <div className="grid md:grid-cols-3 gap-5 mt-8">
                        <div
                          className="
          rounded-3xl
          border border-slate-200
          bg-slate-50
          p-5
        "
                        >
                          <p className="text-sm text-slate-500">Monthly Fee</p>

                          <h3 className="mt-2 text-3xl font-black text-amber-600">
                            Rs.{" "}
                            {memberData?.membershipPlanPrice?.toLocaleString()}
                          </h3>
                        </div>

                        <div
                          className="
          rounded-3xl
          border border-slate-200
          bg-slate-50
          p-5
        "
                        >
                          <p className="text-sm text-slate-500">Duration</p>

                          <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            {memberData?.membershipPlanDurationInDays} Days
                          </h3>
                        </div>

                        <div
                          className="
          rounded-3xl
          border border-slate-200
          bg-slate-50
          p-5
        "
                        >
                          <p className="text-sm text-slate-500">Expiry Date</p>

                          <h3 className="mt-2 text-xl font-bold text-slate-900">
                            {formatDate(memberData?.membershipEndDate)}
                          </h3>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 flex justify-between items-center">
                        <p className="text-sm text-slate-500">
                          Your membership is currently active.
                        </p>

                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="
          cursor-pointer
          rounded-2xl
          bg-gradient-to-r
          from-amber-500
          via-amber-600
          to-orange-700
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          hover:shadow-xl
          hover:-translate-y-0.5
          transition-all
          duration-300
        "
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div
                    className="
                    bg-white
                    rounded-[32px]
                    p-8
                    shadow-xl
                    "
                  >
                    <h3 className="text-2xl font-bold mb-6">Specializations</h3>
                    {/*  */}

                    <div className="flex flex-wrap gap-3">
                      {specializations.length > 0 ? (
                        specializations.map((item: string) => (
                          <div
                            key={item}
                            className="
                            px-5
                            py-3
                            rounded-full
                            bg-gradient-to-r
                            from-amber-100
                            to-orange-100
                            text-amber-800
                            font-semibold
                            shadow-sm
                            "
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">
                          No specializations added.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trainer Details */}
                  <div
                    className="
                    bg-white
                    rounded-[32px]
                    p-8
                    shadow-xl
                    "
                  >
                    <h3 className="text-2xl font-bold mb-6">
                      Professional Details
                    </h3>

                    <div className="grid md:grid-cols-3 gap-5">
                      <div className="rounded-3xl bg-slate-50 p-6">
                        <p className="text-slate-500 text-sm">
                          Membership Status
                        </p>

                        <h4 className="text-xl font-bold mt-2 text-green-600">
                          {memberData?.membershipStatus}
                        </h4>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-6">
                        <p className="text-slate-500 text-sm">Experience</p>

                        <h4 className="text-xl font-bold mt-2">
                          {memberData?.yearsOfExperience || 0} Years
                        </h4>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-6">
                        <p className="text-slate-500 text-sm">Current Rating</p>

                        <h4 className="text-xl font-bold mt-2">
                          ⭐ {memberData?.rating || 0}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditTrainerModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-3xl font-black">
                  Edit Trainer Profile{" "}
                  {isViewingPendingRequest && "(Pending Request)"}
                </h2>

                <p className="text-slate-500 mt-1">
                  {isViewingPendingRequest
                    ? "You can make changes before admin approval."
                    : "Update trainer information"}
                </p>
              </div>

              <button
                onClick={() => setShowEditTrainerModal(false)}
                className="h-12 w-12 rounded-2xl cursor-pointer bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center justify-center border-b pb-8">
                <div className="relative group">
                  <input
                    type="file"
                    id="trainer-photo-upload"
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="trainer-photo-upload"
                    className="relative flex items-center justify-center w-40 h-40 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer transition-all hover:border-amber-500 hover:bg-amber-50"
                  >
                    {trainerForm.profilePicture ? (
                      <>
                        <img
                          src={
                            trainerForm.profilePicture instanceof File
                              ? URL.createObjectURL(trainerForm.profilePicture)
                              : `data:image/jpeg;base64,${trainerForm.profilePicture}`
                          }
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="text-white" size={32} />
                        </div>
                      </>
                    ) : (
                      <Plus
                        className="text-slate-400 group-hover:text-amber-600"
                        size={32}
                      />
                    )}
                  </label>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Profile Picture
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG or JPEG (Square recommended)
                </p>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold mb-5">Personal Information</h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm text-slate-500">First Name</label>

                    <input
                      value={trainerForm.firstName}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Last Name</label>

                    <input
                      value={trainerForm.lastName}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-500">Email</label>

                    <input
                      value={trainerForm.email}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xl font-bold mb-5">Contact</h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label>Phone Number</label>

                    <input
                      value={trainerForm.phoneNumber}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="text-xl font-bold mb-5">Professional Details</h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label>Role</label>

                    <input
                      value={trainerForm.role}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          role: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>

                  <div>
                    <label>Experience (Years)</label>

                    <input
                      type="number"
                      value={trainerForm.yearsOfExperience}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          yearsOfExperience: Number(e.target.value),
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label>Specialization</label>

                    <textarea
                      rows={4}
                      value={trainerForm.specialization}
                      placeholder="Weight Loss, Strength Training, Yoga"
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border"
                    />
                  </div>

                  <div>
                    <label>Gender</label>

                    <select
                      value={trainerForm.gender}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          gender: Number(e.target.value),
                        })
                      }
                      className="w-full mt-2 p-4 rounded-2xl border cursor-pointer"
                    >
                      <option value={1}>Male</option>
                      <option value={2}>Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button
                onClick={() => setShowEditTrainerModal(false)}
                className="px-6 py-3 cursor-pointer rounded-2xl border"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateTrainer}
                className="
                px-8 py-3
                rounded-2xl
                bg-gradient-to-r
                from-amber-500
                via-amber-600
                to-orange-700
                text-white
                cursor-pointer
                font-semibold
                "
              >
                {isViewingPendingRequest ? "Update Request" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
