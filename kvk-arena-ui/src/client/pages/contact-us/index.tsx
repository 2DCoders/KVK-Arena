import { Alert } from "@/components/alert";
import Map from "@/components/map";
import { sendFeedback } from "@/services/feedback-api";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

type FeedbackErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({ visible: false });
  const [errors, setErrors] = useState<FeedbackErrors>({});

  const validateFeedbackForm = () => {
    const validationErrors: FeedbackErrors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      validationErrors.name = "Name is required.";
    } else if (trimmedName.length < 2) {
      validationErrors.name = "Name must contain at least 2 characters.";
    } else if (trimmedName.length > 100) {
      validationErrors.name = "Name cannot exceed 100 characters.";
    }

    if (!trimmedEmail) {
      validationErrors.email = "Email address is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      validationErrors.email = "Please enter a valid email address.";
    } else if (trimmedEmail.length > 150) {
      validationErrors.email = "Email address is too long.";
    }

    if (!trimmedMessage) {
      validationErrors.message = "Message is required.";
    } else if (trimmedMessage.length < 10) {
      validationErrors.message = "Message must contain at least 10 characters.";
    } else if (trimmedMessage.length > 1000) {
      validationErrors.message = "Message cannot exceed 1000 characters.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSendfeedback = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setPageAlert({ visible: false });

    if (!validateFeedbackForm()) {
      return;
    }

    const body = {
      name: name.trim(),
      email: email.trim(),
      feedback: message.trim(),
      phone: "",
    };

    try {
      setLoading(true);

      const response = await sendFeedback(body);

      if (response) {
        setName("");
        setEmail("");
        setMessage("");
        setErrors({});

        setPageAlert({
          visible: true,
          variant: "success",
          title: "Feedback Sent",
          description:
            "Thank you for contacting us. We will respond as soon as possible.",
        });
      }
    } catch (error) {
      console.error("Failed to send feedback:", error);

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Unable to Send Feedback",
        description:
          "Something went wrong while sending your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 py-20 lg:py-28">
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
              <p className="text-sm text-white font-medium">Loading</p>
            </div>
          </div>,
          document.body,
        )}

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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left: modern contact card */}
          <div className="relative">
            <div className="rounded-2xl bg-linear-to-br from-slate-800/80 to-slate-800/70 p-8 shadow-xl lg:backdrop-blur-sm">
              <h2
                data-aos="fade-right"
                className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#2d86fc] via-[#CFEFFF] to-[#8FC0FF] bg-clip-text text-transparent"
              >
                Get In Touch With Us
              </h2>

              <p
                data-aos="fade-right"
                data-aos-delay="100"
                className="mt-4 text-base text-slate-300 max-w-2xl"
              >
                Need help booking, membership details, or corporate packages?
                Send a quick message and our arena team will respond within one
                business day.
              </p>

              <form
                data-aos="fade-right"
                data-aos-delay="200"
                className="mt-8 grid gap-4"
                onSubmit={handleSendfeedback}
                noValidate
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <label htmlFor="feedback-name" className="sr-only">
                      Name
                    </label>

                    <input
                      id="feedback-name"
                      name="name"
                      type="text"
                      aria-label="Name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={
                        errors.name ? "feedback-name-error" : undefined
                      }
                      placeholder="Name"
                      autoComplete="name"
                      maxLength={100}
                      className={`w-full rounded-md border bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 outline-none transition ${
                        errors.name
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-transparent focus:ring-2 focus:ring-[#296BE1]/40"
                      }`}
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);

                        if (errors.name) {
                          setErrors((current) => ({
                            ...current,
                            name: undefined,
                          }));
                        }
                      }}
                    />

                    {errors.name && (
                      <p
                        id="feedback-name-error"
                        className="mt-1.5 text-xs font-medium text-red-400"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-email" className="sr-only">
                      Email
                    </label>

                    <input
                      id="feedback-email"
                      name="email"
                      type="email"
                      aria-label="Email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? "feedback-email-error" : undefined
                      }
                      placeholder="Email"
                      autoComplete="email"
                      maxLength={150}
                      className={`w-full rounded-md border bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 outline-none transition ${
                        errors.email
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                          : "border-transparent focus:ring-2 focus:ring-[#296BE1]/40"
                      }`}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (errors.email) {
                          setErrors((current) => ({
                            ...current,
                            email: undefined,
                          }));
                        }
                      }}
                    />

                    {errors.email && (
                      <p
                        id="feedback-email-error"
                        className="mt-1.5 text-xs font-medium text-red-400"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-message" className="sr-only">
                    Message
                  </label>

                  <textarea
                    id="feedback-message"
                    name="message"
                    aria-label="Message"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? "feedback-message-error" : undefined
                    }
                    placeholder="Message"
                    rows={3}
                    maxLength={1000}
                    className={`w-full resize-none rounded-md border bg-white/3 px-4 py-3 text-slate-100 placeholder-slate-400 outline-none transition ${
                      errors.message
                        ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                        : "border-transparent focus:ring-2 focus:ring-[#296BE1]/40"
                    }`}
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);

                      if (errors.message) {
                        setErrors((current) => ({
                          ...current,
                          message: undefined,
                        }));
                      }
                    }}
                  />

                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div>
                      {errors.message && (
                        <p
                          id="feedback-message-error"
                          className="text-xs font-medium text-red-400"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-xs ${
                        message.length > 1000
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {message.length}/1000
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#296BE1] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be] disabled:cursor-not-allowed disabled:bg-[#296BE1]/50 disabled:shadow-none"
                  >
                    <Send size={16} />

                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: clean map card */}
          <div
            className="relative flex items-center justify-center"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10 md:hidden">
              <div className="flex h-full min-h-72 flex-col justify-between bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6 text-slate-900">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#296BE1]">
                    Find Us
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-tight">
                    KVK Arena
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Open the map in Google Maps for directions. The live map is
                    shown on larger screens.
                  </p>
                </div>

                <a
                  href="https://maps.app.goo.gl/AUDR2VgjT6JbvmvR8"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[#296BE1] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(41,107,225,0.22)] transition hover:bg-[#1f58be]"
                >
                  Open Map
                </a>
              </div>
            </div>

            <div className="hidden w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10 md:block">
              <div className="aspect-square w-full sm:aspect-auto sm:h-113">
                <Map
                  locationLink="https://maps.app.goo.gl/AUDR2VgjT6JbvmvR8"
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Mobile */}
          <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(45,134,252,0.25)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#2d86fc]/10 text-[#2d86fc] group-hover:scale-110 transition">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Mobile</p>
                <p className="text-sm font-semibold text-white">
                  +94 76 560 5885
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
                  kvkarena28@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(207,239,255,0.15)]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 group-hover:scale-110 transition">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p className="text-sm font-semibold text-white">
                  No.387, Galle road, Colombo 4
                </p>
              </div>
            </div>
          </div>

          {/* Working Days */}
          <div className="group rounded-xl bg-white/5 p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300 group-hover:scale-110 transition">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Working Days</p>
                <p className="text-sm font-semibold text-white">
                  Monday – Sunday
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
