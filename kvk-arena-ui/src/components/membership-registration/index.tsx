import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { registerMember } from "@/services/arena-membership-api";

type MembershipRegistrationProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  whatsapp: string;
  email: string;
  nic: string;
};

type FormErrors = Partial<Record<keyof Pick<FormState, "firstName" | "lastName" | "whatsapp" | "email" | "nic"> | "gender", string>>;

export default function MembershipRegistration({
  open,
  onClose,
  onSuccess,
  onFailure,
}: MembershipRegistrationProps) {
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    whatsapp: "",
    email: "",
    nic: "",
  });
  const [gender, setGender] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const genderOptions = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
  ];

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    const whatsappValue = formData.whatsapp.trim();
    if (!whatsappValue) {
      nextErrors.whatsapp = "WhatsApp number is required.";
    } else if (!/^0\d{9}$/.test(whatsappValue)) {
      nextErrors.whatsapp = "Enter a valid mobile number, such as 07xxxxxxxx.";
    }

    console.log("Validating email:", formData.email);

    const emailValue = formData.email.trim();
    if (!emailValue) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (gender !== 1 && gender !== 2) {
      nextErrors.gender = "Select your gender.";
    }

    return nextErrors;
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmRegistration = async () => {
    const payload = new FormData();

    payload.append("firstName", formData.firstName.trim());
    payload.append("lastName", formData.lastName.trim());
    payload.append("userName", formData.email.split("@")[0].trim());
    payload.append("phone", formData.whatsapp.trim());
    payload.append("email", formData.email.trim());
    payload.append("gender", String(gender));
    payload.append("passwordHash", formData.firstName.trim());
    payload.append("status", "1");

    if (formData.nic.trim()) {
      payload.append("nic", formData.nic.trim());
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      await registerMember(payload);

      setShowConfirmModal(false);
      setApiError(null);
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        whatsapp: "",
        email: "",
        nic: "",
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (err) {
      const responseMessage = (err as {
        response?: { data?: { message?: unknown } };
      })?.response?.data?.message;
      const errorMessage =
        typeof responseMessage === "string" && responseMessage.trim()
          ? responseMessage
          : "Unable to complete registration. Please try again.";

      setApiError(errorMessage);
      setShowConfirmModal(false);
      onFailure();
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50000 bg-slate-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      {loading &&
        createPortal(
          <div className="fixed inset-0 z-9999999999 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
              <p className="text-sm text-white font-medium">Loading</p>
            </div>
          </div>,
          document.body,
        )}

      <div className="relative z-10 h-full w-full overflow-y-auto">
        <div className="flex h-screen w-screen items-stretch">
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7f9fd]">
            <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#296BE1]/15 bg-[#296BE1]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#296BE1]">
                    {/* <Info size={14} /> */}
                    Full Arena Membership
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close membership registration modal"
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
              {/* Desktop information panel */}
              <aside className="hidden overflow-y-auto border-r border-slate-200 bg-[#081a3d] px-8 py-10 text-white lg:block">
                <div className="mx-auto max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                    Why register
                  </p>

                  <h3 className="mt-4 text-4xl font-black tracking-tight">
                    Join the arena with one simple application.
                  </h3>

                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
                    The membership is designed for people who want convenience, priority
                    handling, and a better experience across KVK Arena services.
                  </p>

                  <div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1] text-white shadow-[0_14px_30px_rgba(41,107,225,0.32)]">
                        <Info size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8FC0FF]">
                          Registration note
                        </p>

                        <p className="mt-2 text-sm leading-7 text-white/78">
                          Use a reachable WhatsApp number and email address so our team can
                          contact you quickly after you apply.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      ["01", "Enter your details", "Complete the membership form."],
                      ["02", "Confirm application", "Review and confirm your details."],
                      ["03", "Arena follow-up", "Our team will contact you via WhatsApp."],
                    ].map(([step, title, description]) => (
                      <div
                        key={step}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-[#8FC0FF]">
                          {step}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">{title}</p>
                          <p className="mt-1 text-xs text-white/60">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Form section */}
              <main className="min-h-0 overflow-y-auto bg-white px-4 pb-8 pt-4 sm:px-7 sm:py-8 lg:px-8 lg:py-10">
                <div className="mx-auto w-full max-w-2xl">
                  {/* Mobile-only heading */}
                  <div className="mb-5 lg:hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#296BE1]">
                      Membership application
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      Enter your details
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Complete the form and our team will contact you through WhatsApp.
                    </p>
                  </div>

                  {/* Mobile step indicator */}
                  <div className="mb-6 lg:hidden">
                    <div className="relative flex items-start justify-between">
                      <div
                        aria-hidden="true"
                        className="absolute left-[16%] right-[16%] top-4 h-px bg-slate-200"
                      />

                      {[
                        ["1", "Details"],
                        ["2", "Confirm"],
                        ["3", "Follow-up"],
                      ].map(([step, label], index) => (
                        <div
                          key={step}
                          className="relative z-10 flex min-w-0 flex-1 flex-col items-center"
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${index === 0
                                ? "border-[#296BE1] bg-[#296BE1] text-white shadow-[0_7px_18px_rgba(41,107,225,0.25)]"
                                : "border-slate-200 bg-white text-slate-400"
                              }`}
                          >
                            {step}
                          </div>

                          <span
                            className={`mt-2 text-center text-[10px] font-semibold sm:text-xs ${index === 0 ? "text-[#296BE1]" : "text-slate-400"
                              }`}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form className="grid gap-4 sm:gap-5" onSubmit={handleSubmit}>
                    {apiError && (
                      <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                      >
                        {apiError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <Field
                        label="First name"
                        value={formData.firstName}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value;

                          setFormData((current) => ({
                            ...current,
                            firstName: value,
                          }));

                          if (apiError) {
                            setApiError(null);
                          }

                          if (errors.firstName) {
                            setErrors((current) => ({
                              ...current,
                              firstName: undefined,
                            }));
                          }
                        }}
                        name="firstName"
                        placeholder="Enter first name"
                        error={errors.firstName}
                        required
                        helperText=""
                      />

                      <Field
                        label="Last name"
                        value={formData.lastName}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value;

                          setFormData((current) => ({
                            ...current,
                            lastName: value,
                          }));

                          if (apiError) {
                            setApiError(null);
                          }

                          if (errors.lastName) {
                            setErrors((current) => ({
                              ...current,
                              lastName: undefined,
                            }));
                          }
                        }}
                        name="lastName"
                        placeholder="Enter last name"
                        error={errors.lastName}
                        required
                        helperText=""
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <Field
                        label="WhatsApp number"
                        value={formData.whatsapp}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value.replace(/\D/g, "").slice(0, 10);

                          setFormData((current) => ({
                            ...current,
                            whatsapp: value,
                          }));

                          if (apiError) {
                            setApiError(null);
                          }

                          if (errors.whatsapp) {
                            setErrors((current) => ({
                              ...current,
                              whatsapp: undefined,
                            }));
                          }
                        }}
                        name="whatsapp"
                        type="tel"
                        inputMode="numeric"
                        placeholder="07xxxxxxxx"
                        error={errors.whatsapp}
                        required
                        helperText=""
                      />

                      <Field
                        label="Email address"
                        value={formData.email}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value;

                          setFormData((current) => ({
                            ...current,
                            email: value,
                          }));

                          if (apiError) {
                            setApiError(null);
                          }

                          if (errors.email) {
                            setErrors((current) => ({
                              ...current,
                              email: undefined,
                            }));
                          }
                        }}
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        error={errors.email}
                        required
                        helperText=""
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Gender
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {genderOptions.map(({ value, label }) => (
                          <label
                            key={value}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${gender === value
                                ? "border-[#296BE1] bg-[#296BE1]/6 text-slate-950 ring-2 ring-[#296BE1]/10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={value}
                              checked={gender === value}
                              onChange={() => {
                                setGender(value);

                                if (errors.gender) {
                                  setErrors((current) => ({
                                    ...current,
                                    gender: undefined,
                                  }));
                                }
                              }}
                              className="h-4 w-4 accent-[#296BE1]"
                            />

                            <span className="text-sm font-medium">{label}</span>
                          </label>
                        ))}
                      </div>

                      {errors.gender && (
                        <p className="mt-2 text-xs text-red-600">{errors.gender}</p>
                      )}
                    </div>

                    <div className="mt-1 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 lg:hidden">
                      <p className="text-xs leading-5 text-slate-600">
                        Make sure your WhatsApp number is active. Our team will use it for
                        verification and membership payment instructions.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
                      <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        By applying, you agree that KVK Arena may contact you for membership
                        verification and next steps.
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#296BE1] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(41,107,225,0.28)] transition hover:bg-[#2158bc] disabled:cursor-not-allowed disabled:opacity-70 sm:ml-auto sm:w-auto sm:min-w-40"
                      >
                        {isSubmitting ? "Applying..." : "Continue"}
                      </button>
                    </div>
                  </form>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-60000 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[92%] max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">
              Confirm Registration
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to submit your membership application?
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border cursor-pointer border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={isSubmitting}
                className="rounded-xl bg-[#296BE1] px-5 cursor-pointer py-2.5 font-medium text-white hover:bg-[#2158bc] disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Yes, Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

type FieldProps = {
  label: string;
  helperText: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function Field({
  label,
  type = "text",
  placeholder,
  required,
  helperText,
  error,
  ...inputProps
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        {...inputProps}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error
          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
          : "border-slate-200 focus:border-[#296BE1] focus:ring-[#296BE1]/10"
          }`}
      />
      <p className={`mt-2 text-xs leading-5 ${error ? "text-red-600" : "text-slate-500"}`}>
        {error ?? helperText}
      </p>
    </label>
  );
}
