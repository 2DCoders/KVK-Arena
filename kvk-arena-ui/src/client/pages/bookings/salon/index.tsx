import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Clock3,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getNextWorkingDays } from "@/services/holidays-api";
import { getSalonServiceItems } from "@/services/salon-service-api";
import {
  checkDayAvailability,
  createSalonBookingWithPayment,
  reverseSalonBookingPayment,
} from "@/services/salon-booking-api";
import { startPayHereCheckout } from "@/services/payhere";
import Alert from "@/components/alert";

/* =========================================================
   Types
   ========================================================= */

type ServiceItem = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
};

type WorkingDay = {
  iso: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
};

type AvailableWindow = {
  from: string;
  to: string;
};

const TIME_SLOT_STEP_MINUTES = 30;
const SERVICES_PREVIEW_LIMIT = 8;

// Accepts local Sri Lankan mobile/landline numbers: 0 followed by 9 digits,
// e.g. 0771234567 (10 digits total).
const SRI_LANKA_PHONE_REGEX = /^0[1-9][0-9]{8}$/;

const isValidSriLankanPhone = (value: string) =>
  SRI_LANKA_PHONE_REGEX.test(value.replace(/[\s-]/g, ""));

const normalizeService = (service: any): ServiceItem => ({
  id: String(service.id),
  name: String(service.name ?? "Service"),
  price: Number(service.price ?? 0),
  durationMinutes: Number(service.durationMinutes ?? 0),
  isActive: Boolean(service.isActive),
});

const toIsoDate = (value: unknown): string => {
  const text = String(value ?? "");
  return text.length >= 10 ? text.slice(0, 10) : text;
};

const buildWorkingDays = (rawDates: unknown[]): WorkingDay[] => {
  const todayIso = new Date().toISOString().slice(0, 10);

  return rawDates.map((raw) => {
    const iso = toIsoDate(raw);
    const parsed = new Date(`${iso}T00:00:00`);

    return {
      iso,
      weekday: parsed
        .toLocaleDateString("en-GB", { weekday: "short" })
        .toUpperCase(),
      dayNumber: parsed.toLocaleDateString("en-GB", { day: "2-digit" }),
      isToday: iso === todayIso,
    };
  });
};

const timeStringToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
};

const formatTimeLabel = (value: string): string => {
  const [hours, minutes] = value.split(":").map(Number);
  const parsed = new Date();
  parsed.setHours(hours, minutes, 0, 0);

  return parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const buildTimeSlots = (windows: AvailableWindow[]): string[] => {
  const slots = new Set<string>();

  windows.forEach((window) => {
    const fromMinutes = timeStringToMinutes(window.from);
    const toMinutes = timeStringToMinutes(window.to);

    if (toMinutes <= fromMinutes) {
      slots.add(minutesToTimeString(fromMinutes));
      return;
    }

    for (
      let minute = fromMinutes;
      minute <= toMinutes;
      minute += TIME_SLOT_STEP_MINUTES
    ) {
      slots.add(minutesToTimeString(minute));
    }

    slots.add(minutesToTimeString(toMinutes));
  });

  return Array.from(slots).sort(
    (a, b) => timeStringToMinutes(a) - timeStringToMinutes(b),
  );
};

const extractResponseData = (payload: unknown): any => {
  const record =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  const additionalData = record.additionalData as
    | Record<string, unknown>
    | undefined;

  return (
    additionalData?.Response ??
    additionalData?.response ??
    record.response ??
    payload
  );
};

/* =========================================================
   Salon Booking Section
   ========================================================= */

export default function SalonBooking() {
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState(true);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formErrors, setFormErrors] = useState<{
    customerName?: string;
    phoneNumber?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({ visible: false });

  /* -------------------------------------------------------------------------- */
  /* Load working days                                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const loadWorkingDays = async () => {
      try {
        setIsLoadingDays(true);
        // getNextWorkingDays treats the given date as exclusive, so pass
        // yesterday to include today as the first selectable working day.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().slice(0, 10);
        const response = await getNextWorkingDays(startDate, 7);
        const rows = Array.isArray(response) ? response : [];
        const days = buildWorkingDays(rows);

        setWorkingDays(days);
        setSelectedDate((previous) => previous || days[0]?.iso || "");
      } catch (error) {
        console.error("Unable to load working days:", error);
      } finally {
        setIsLoadingDays(false);
      }
    };

    void loadWorkingDays();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Load services                                                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await getSalonServiceItems();
        const rows = Array.isArray(response.data) ? response.data : [];

        setServices(
          rows.map(normalizeService).filter((service) => service.isActive),
        );
      } catch (error) {
        console.error("Unable to load salon services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    void loadServices();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Derived selections                                                         */
  /* -------------------------------------------------------------------------- */

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds],
  );

  const filteredServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(query),
    );
  }, [services, serviceSearch]);

  const visibleServices = useMemo(() => {
    if (showAllServices || serviceSearch.trim()) return filteredServices;
    return filteredServices.slice(0, SERVICES_PREVIEW_LIMIT);
  }, [filteredServices, showAllServices, serviceSearch]);

  const hasMoreServices =
    !serviceSearch.trim() && filteredServices.length > SERVICES_PREVIEW_LIMIT;

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0,
  );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId],
    );
    setSelectedTime("");
    setIsBooked(false);
  };

  /* -------------------------------------------------------------------------- */
  /* Availability                                                               */
  /* -------------------------------------------------------------------------- */

  const fetchAvailability = async (date: string, serviceIds: string[]) => {
    const response = await checkDayAvailability(date, serviceIds);
    const data = extractResponseData(response);
    const windows: AvailableWindow[] = Array.isArray(data?.availableWindows)
      ? data.availableWindows
      : [];

    return {
      slots: buildTimeSlots(windows),
      message: String(data?.message ?? "No available time slots found."),
    };
  };

  useEffect(() => {
    if (!selectedDate || selectedServiceIds.length === 0) {
      setAvailableSlots([]);
      setAvailabilityMessage("");
      setSelectedTime("");
      return;
    }

    let isCancelled = false;

    const loadAvailability = async () => {
      try {
        setIsCheckingAvailability(true);
        setSelectedTime("");

        const { slots, message } = await fetchAvailability(
          selectedDate,
          selectedServiceIds,
        );

        if (isCancelled) return;

        setAvailableSlots(slots);
        setAvailabilityMessage(message);
      } catch (error) {
        console.error("Unable to check availability:", error);

        if (isCancelled) return;

        setAvailableSlots([]);
        setAvailabilityMessage(
          "Unable to check availability right now. Please try again.",
        );
      } finally {
        if (!isCancelled) setIsCheckingAvailability(false);
      }
    };

    void loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [selectedDate, selectedServiceIds]);

  /* -------------------------------------------------------------------------- */
  /* Submission                                                                 */
  /* -------------------------------------------------------------------------- */

  const validateForm = () => {
    const errors: { customerName?: string; phoneNumber?: string } = {};

    if (!customerName.trim()) {
      errors.customerName = "Please enter your name.";
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Please enter your mobile number.";
    } else if (!isValidSriLankanPhone(phoneNumber)) {
      errors.phoneNumber = "Enter a valid mobile number (e.g. 0771234567).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canSubmit =
    Boolean(selectedDate) &&
    selectedServiceIds.length > 0 &&
    Boolean(selectedTime) &&
    Boolean(customerName.trim()) &&
    isValidSriLankanPhone(phoneNumber);

  const handleConfirmBooking = async () => {
    if (!validateForm() || !canSubmit) return;

    try {
      setIsSubmitting(true);

      // Re-check right before booking — the slot may have just been taken.
      const { slots: freshSlots, message: freshMessage } =
        await fetchAvailability(selectedDate, selectedServiceIds);

      setAvailableSlots(freshSlots);
      setAvailabilityMessage(freshMessage);

      if (!freshSlots.includes(selectedTime)) {
        setSelectedTime("");

        setPageAlert({
          visible: true,
          variant: "warning",
          title: "Time no longer available",
          description:
            "That time was just booked by someone else. Please choose another available time.",
        });

        return;
      }

      const trimmedName = customerName.trim();
      const trimmedPhone = phoneNumber.trim();

      const payload = {
        customerName: trimmedName,
        phoneNumber: trimmedPhone,
        memberId: null,
        bookingDate: selectedDate,
        startTime: selectedTime,
        status: 1, // Pending — confirmed only once PayHere verifies payment
        totalAmount: totalPrice,
        discountAmount: 0,
        notes: null,
        paymentType: 2, // Credit/Debit card — paid via PayHere
        services: selectedServices.map((service) => ({
          saloonServiceId: service.id,
          price: service.price,
          discountAmount: 0,
        })),
      };

      const paymentResponse = await createSalonBookingWithPayment(payload);

      const payment =
        paymentResponse?.additionalData?.response ??
        paymentResponse?.response ??
        paymentResponse;

      startPayHereCheckout(
        {
          orderId: payment.orderId,
          merchantId: payment.merchantId,
          currency: payment.currency,
          amount: payment.amount,
          hash: payment.hash,
          items: "Salon Appointment",
          firstName: trimmedName,
          phone: trimmedPhone,
          notifyPath: "saloon/bookings/notify",
        },
        {
          onCompleted: () => {
            setIsBooked(true);
            setSelectedServiceIds([]);
            setSelectedTime("");
            setCustomerName("");
            setPhoneNumber("");

            setPageAlert({
              visible: true,
              variant: "success",
              title: "Booking confirmed",
              description: "Your salon appointment was booked successfully.",
            });
          },
          onDismissed: () => {
            void reverseSalonBookingPayment(payment.orderId);
            setPageAlert({
              visible: true,
              variant: "warning",
              title: "Payment cancelled",
              description: "Your appointment was not booked since payment was cancelled.",
            });
          },
          onError: () => {
            void reverseSalonBookingPayment(payment.orderId);
            setPageAlert({
              visible: true,
              variant: "error",
              title: "Payment failed",
              description: "Something went wrong while processing your payment. Please try again.",
            });
          },
        },
      );
    } catch (error: any) {
      console.error("Unable to create booking:", error);

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Booking failed",
        description:
          error?.response?.data?.message ||
          "Unable to complete your booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingDays || isLoadingServices;

  return (
    <section className="relative overflow-hidden bg-[#160d20] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
      {/* Alert */}
      {pageAlert.visible &&
        createPortal(
          <Alert
            variant={pageAlert.variant as any}
            title={pageAlert.title}
            description={pageAlert.description}
            onClose={() => setPageAlert((s) => ({ ...s, visible: false }))}
          />,
          document.body,
        )}

      {/* =========================================
          BACKGROUND DECORATION
      ========================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[140px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-[1250px]">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="mx-auto mb-12 max-w-[720px] text-center sm:mb-16">

          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-purple-300/40" />

            <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-purple-200/80">
              <Sparkles size={12} />
              Book Your Visit
            </span>

            <span className="h-px w-10 bg-purple-300/40" />
          </div>

          <h2 className="text-[42px] font-medium leading-[0.95] tracking-[-0.05em] text-white sm:text-[56px] lg:text-[72px]">
            Your Time.
            <br />

            <span className="text-purple-200/80">
              Your Beauty.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-[560px] text-sm leading-6 text-white/50 sm:text-base">
            Choose your preferred services, date, and time.
            We&apos;ll make sure everything is ready for your
            perfect salon experience.
          </p>
        </div>


        {/* =========================================
            BOOKING CONTAINER
        ========================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30 backdrop-blur-xl">

          {/* Top accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

            {/* =====================================
                LEFT INFORMATION PANEL
            ===================================== */}

            <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">

              {/* Decorative circle */}
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-purple-300/10" />

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-purple-300/10" />

              <div className="relative">

                <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-purple-300/70">
                  Appointment
                </span>

                <h3 className="mt-5 max-w-[400px] text-3xl font-medium leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  Take a moment
                  <br />
                  <span className="text-white/50">
                    for yourself.
                  </span>
                </h3>

                <p className="mt-5 max-w-[390px] text-sm leading-6 text-white/45">
                  Our beauty specialists are here to create a
                  personalized experience designed around you.
                </p>
              </div>


              {/* Benefits */}

              <div className="relative mt-10 space-y-4 lg:mt-16">

                {[
                  "Personalized beauty consultation",
                  "Premium salon experience",
                  "Professional beauty specialists",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-purple-300/20 bg-purple-300/10">
                      <Check
                        size={13}
                        className="text-purple-200"
                      />
                    </span>

                    <span className="text-sm text-white/55">
                      {item}
                    </span>
                  </div>
                ))}

              </div>

            </div>


            {/* =====================================
                RIGHT BOOKING FORM
            ===================================== */}

            <div className="p-7 sm:p-10 lg:p-12">

              {/* Services */}

              <div>
                <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                  Select Services
                </label>

                {isLoadingServices ? (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Loader2 size={14} className="animate-spin" />
                    Loading services...
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-xs text-white/40">
                    No services available right now.
                  </p>
                ) : (
                  <>
                    {services.length > SERVICES_PREVIEW_LIMIT && (
                      <div className="group relative mb-3">
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                        />

                        <input
                          type="text"
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          placeholder="Search services..."
                          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-purple-300/40 focus:ring-4 focus:ring-purple-500/10"
                        />
                      </div>
                    )}

                    {filteredServices.length === 0 ? (
                      <p className="text-xs text-white/40">
                        No services match &quot;{serviceSearch}&quot;.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        {visibleServices.map((item) => {
                          const active = selectedServiceIds.includes(item.id);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleService(item.id)}
                              className={`
                                w-full
                                cursor-pointer
                                truncate
                                rounded-full
                                border
                                px-4
                                py-2.5
                                text-xs
                                font-medium
                                transition-all
                                duration-300
                                sm:w-auto

                                ${
                                  active
                                    ? "border-purple-300/40 bg-purple-300 text-[#160d20]"
                                    : "border-white/10 bg-white/[0.04] text-white/55 hover:border-purple-300/30 hover:bg-white/[0.08] hover:text-white"
                                }
                              `}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {hasMoreServices && (
                      <button
                        type="button"
                        onClick={() => setShowAllServices((prev) => !prev)}
                        className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-purple-200/80 transition hover:text-purple-100"
                      >
                        {showAllServices ? (
                          <>
                            View less
                            <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            View more ({filteredServices.length - SERVICES_PREVIEW_LIMIT} more)
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>


              {/* Date & Time */}

              <div className="mt-8 grid gap-5">

                {/* Date */}

                <div>
                  <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Select Date
                  </label>

                  {isLoadingDays ? (
                    <div className="flex h-14 items-center gap-2 text-xs text-white/40">
                      <Loader2 size={14} className="animate-spin" />
                      Loading days...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {workingDays.map((day) => {
                        const active = selectedDate === day.iso;

                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.iso);
                              setIsBooked(false);
                            }}
                            className={`flex h-14 min-w-[52px] cursor-pointer flex-col items-center justify-center rounded-2xl border px-2 text-center transition-all duration-300 ${
                              active
                                ? "border-purple-300/40 bg-purple-300 text-[#160d20]"
                                : "border-white/10 bg-white/[0.045] text-white/55 hover:border-purple-300/30 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <span
                              className={`text-[9px] font-semibold uppercase ${
                                active ? "text-[#160d20]/60" : "text-white/35"
                              }`}
                            >
                              {day.weekday}
                            </span>
                            <span className="text-sm font-bold">
                              {day.dayNumber}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>


                {/* Time */}

                <div>
                  <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Select Time
                  </label>

                  {isCheckingAvailability ? (
                    <div className="flex h-14 items-center gap-2 text-xs text-white/40">
                      <Loader2 size={14} className="animate-spin" />
                      Checking availability...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="flex h-14 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-xs text-white/40">
                      <Clock3 size={14} />
                      {selectedServiceIds.length === 0
                        ? "Pick a service first"
                        : availabilityMessage || "No available times"}
                    </div>
                  ) : (
                    <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:max-h-64 sm:grid-cols-4">
                      {availableSlots.map((slot) => {
                        const active = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`cursor-pointer rounded-full border px-2 py-2 text-[11px] font-medium transition-all duration-300 sm:text-xs ${
                              active
                                ? "border-purple-300/40 bg-purple-300 text-[#160d20]"
                                : "border-white/10 bg-white/[0.04] text-white/55 hover:border-purple-300/30 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            {formatTimeLabel(slot)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>


              {/* Customer Details */}

              {selectedTime && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-name"
                    className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45"
                  >
                    Your Name
                  </label>

                  <div className="group relative">
                    <User
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-purple-200/60"
                    />

                    <input
                      id="booking-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formErrors.customerName) {
                          setFormErrors((prev) => ({
                            ...prev,
                            customerName: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter your name"
                      className={`h-14 w-full appearance-none rounded-2xl border bg-white/[0.045] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:bg-white/[0.07] focus:ring-4 ${
                        formErrors.customerName
                          ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-500/10"
                          : "border-white/10 focus:border-purple-300/40 focus:ring-purple-500/10"
                      }`}
                    />
                  </div>

                  {formErrors.customerName && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      {formErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45"
                  >
                    Mobile Number
                  </label>

                  <div className="group relative">
                    <Phone
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-purple-200/60"
                    />

                    <input
                      id="booking-phone"
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ""));
                        if (formErrors.phoneNumber) {
                          setFormErrors((prev) => ({
                            ...prev,
                            phoneNumber: undefined,
                          }));
                        }
                      }}
                      placeholder="e.g. 0771234567"
                      className={`h-14 w-full appearance-none rounded-2xl border bg-white/[0.045] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:bg-white/[0.07] focus:ring-4 ${
                        formErrors.phoneNumber
                          ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-500/10"
                          : "border-white/10 focus:border-purple-300/40 focus:ring-purple-500/10"
                      }`}
                    />
                  </div>

                  {formErrors.phoneNumber && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              )}


              {/* Selected Appointment Preview */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Selected Services
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {selectedServices.length > 0
                        ? selectedServices.map((s) => s.name).join(", ")
                        : "No services selected"}
                    </p>
                  </div>

                  {totalPrice > 0 && (
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-medium text-purple-200">
                        {new Intl.NumberFormat("en-LK", {
                          style: "currency",
                          currency: "LKR",
                          minimumFractionDigits: 0,
                        }).format(totalPrice)}
                      </p>
                    </div>
                  )}

                </div>

                {selectedDate && selectedTime && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Appointment
                    </p>

                    <p className="mt-1 text-sm font-medium text-purple-200">
                      {selectedDate} · {formatTimeLabel(selectedTime)}
                    </p>
                  </div>
                )}

              </div>


              {/* Confirm Booking */}

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!canSubmit || isSubmitting || isLoading}
                className="
                  group
                  mt-6
                  flex
                  h-14
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-purple-200
                  px-6
                  text-sm
                  font-semibold
                  text-[#160d20]
                  transition-all
                  duration-300

                  hover:bg-white
                  hover:shadow-xl
                  hover:shadow-purple-500/10

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>


              {/* Result */}

              {isBooked && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 px-4 py-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300/10">
                    <Check
                      size={15}
                      className="text-emerald-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-200">
                      Appointment booked
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/40">
                      We look forward to seeing you.
                    </p>
                  </div>

                </div>
              )}

              {!isBooked && !canSubmit && (
                <p className="mt-4 flex items-center gap-2 text-[11px] leading-5 text-white/30">
                  <AlertCircle size={12} className="shrink-0" />
                  Select services, a date, a time, and enter your details to
                  continue.
                </p>
              )}

              <p className="mt-5 text-center text-[10px] leading-5 text-white/30">
                Availability is subject to confirmation by our salon team.
              </p>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
