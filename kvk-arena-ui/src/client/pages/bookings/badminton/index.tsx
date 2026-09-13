import { useEffect, useMemo, useState } from "react";
import courtImg from "@/assets/court.png";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Trophy,
  Users,
  Star,
  X,
  Clock3,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  CircleCheck,
  Info,
} from "lucide-react";
import { getCourts } from "@/services/court-api";
import { bookingSlots, confirmBooking } from "@/services/booking-api";
import { getNextWorkingDays } from "@/services/holidays-api";
import { getCourtSlotsAvailability } from "@/services/court-slot-api";
import Alert from "@/components/alert";
import { createPortal } from "react-dom";

type CourtCard = {
  id: string;
  name: string;
  price: number;
  status: number;
  image: string;
  features: string[];
};

type BookingDay = {
  fullDate: string;
  day: string;
  date: number;
  month: string;
  isToday: boolean;
};

type CourtSlot = {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isBooked: boolean;
  price: number;
  label: string;
  available: boolean;
};

type SelectedSlotDetail = {
  courtId: string;
  courtName: string;
  slotId: string;
  slotIndex: number;
  label: string;
  price: number;
};

const formatSlotLabel = (startTime: string, endTime: string) => {
  const formatTime = (time: string) => {
    const [hoursText, minutesText] = time.split(":");
    const hoursNumber = Number(hoursText);
    const minutes = minutesText ?? "00";
    const period = hoursNumber >= 12 ? "PM" : "AM";
    const displayHours = hoursNumber % 12 === 0 ? 12 : hoursNumber % 12;

    return `${displayHours.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const toDateOnlyString = (date: Date) => date.toISOString().split("T")[0];

export default function BadmintonBookings() {
  const [courts, setCourts] = useState<CourtCard[]>([]);
  const [workingDays, setWorkingDays] = useState<BookingDay[]>([]);
  const [courtSlots, setCourtSlots] = useState<Record<string, CourtSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlotsByCourt, setSelectedSlotsByCourt] = useState<
    Record<string, number[]>
  >({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhoneError, setCustomerPhoneError] = useState("");
  const [holdIds, setHoldIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({ visible: false });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = yesterday.toISOString().split("T")[0];

  const fallbackDays = useMemo<BookingDay[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      return {
        fullDate: toDateOnlyString(date),
        day: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        date: date.getDate(),
        month: date
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
        isToday: index === 0,
      };
    });
  }, []);

  const displayedDays = workingDays.length > 0 ? workingDays : fallbackDays;

  useEffect(() => {
    const fetchWorkingDays = async () => {
      try {
        const res = await getNextWorkingDays(startDate, 7);

        const formattedDates = res.map((dateStr: string) => {
          const date = new Date(dateStr);
          const today = new Date();

          return {
            fullDate: dateStr,
            day: date.toLocaleDateString("en-US", {
              weekday: "short",
            }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", {
              month: "short",
            }),
            isToday: date.toDateString() === today.toDateString(),
          };
        });

        setWorkingDays(formattedDates);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWorkingDays();
  }, []);

  useEffect(() => {
    const handleGetCourts = async () => {
      try {
        const response = await getCourts();

        const mappedCourts = response.map((court: any) => ({
          id: court.id,
          name: court.name,
          price: court.pricePerSlot,
          status: court.status,
          image: courtImg,
          features: ["Premium Court", "Clean Environment", "Online Booking"],
        }));

        setCourts(mappedCourts);
      } catch (error) {
        console.error("Error fetching courts:", error);
      }
    };

    handleGetCourts();
  }, []);

  useEffect(() => {
    const fetchCourtSlots = async () => {
      if (courts.length === 0 || displayedDays.length === 0) {
        return;
      }

      const selectedDateString = displayedDays[selectedDate]?.fullDate;

      if (!selectedDateString) {
        return;
      }

      try {
        const response = await Promise.all(
          courts.map(async (court) => {
            const slots = await getCourtSlotsAvailability(
              court.id,
              selectedDateString
            );

            const formattedSlots = (Array.isArray(slots) ? slots : []).map(
              (slot: any) => ({
                id: slot.id,
                courtId: slot.courtId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.isActive,
                isBooked: slot.isBooked,
                price: slot.price,
                label: formatSlotLabel(slot.startTime, slot.endTime),
                available: slot.isActive && !slot.isBooked,
              })
            );

            return [court.id, formattedSlots] as const;
          })
        );

        setCourtSlots(Object.fromEntries(response));
      } catch (error) {
        console.error("Error fetching court slots availability:", error);
      }
    };

    fetchCourtSlots();
  }, [courts, displayedDays, selectedDate]);

  useEffect(() => {
    setSelectedSlotsByCourt({});
  }, [selectedDate]);

  const isPastSlot = (slotTime: string, selectedDateIndex: number) => {
    if (selectedDateIndex !== 0) return false;

    const startTime = slotTime.split(" - ")[0];

    const slotDate = new Date();
    const [time, period] = startTime.split(" ");

    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate.getTime() < new Date().getTime();
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerPhoneError("");
    setHoldIds([]);
  };

  const handleBookingMultipleSlots = async () => {
    if (selectedSlotDetails.length === 0) {
      setPageAlert({
        visible: true,
        variant: "warning",
        title: "No slots selected",
        description: "Please select at least one slot before continuing.",
      });

      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        bookings: selectedSlotDetails.map((slot) => ({
          courtId: slot.courtId,
          courtSlotId: slot.slotId,
          bookingDate: selectedDateInfo.fullDate.split("T")[0],
        })),
        totalAmount: total,
        paymentTypes: 1,
      };

      const holdResponse = await bookingSlots(requestBody);
      const holdItems =
        holdResponse?.additionalData?.response ??
        holdResponse?.response ??
        holdResponse ??
        [];

      const holdIds = Array.isArray(holdItems)
        ? holdItems
          .map((item: any) => item?.holdId ?? item?.id)
          .filter(Boolean)
        : [];

      if (holdIds.length === 0) {
        throw new Error("The booking service did not return any hold IDs.");
      }

      setHoldIds(holdIds);
      setIsBookingModalOpen(true);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unable to complete the booking.";

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Booking failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      if (!customerPhone.trim()) {
        setCustomerPhoneError("Please enter a mobile number starting with 07 and containing exactly 10 digits.");
      }

      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Missing customer details",
        description: "Please enter the customer name and mobile number.",
      });

      return;
    }

    if (!/^07\d{8}$/.test(customerPhone)) {
      setCustomerPhoneError("Please enter a valid mobile number starting with 07 and containing exactly 10 digits.");
      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Invalid mobile number",
        description: "Please enter a valid mobile number starting with 07 and containing exactly 10 digits.",
      });

      return;
    }

    setCustomerPhoneError("");

    if (holdIds.length === 0) {
      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Booking hold expired",
        description: "Please select the slots again and proceed to payment.",
      });

      return;
    }

    setLoading(true);
    try {
      await confirmBooking({
        holdIds,
        customerDetails: {
          customerName: customerName.trim(),
          phoneNumber: customerPhone.trim(),
          paymentType: 1,
        },
      });

      setPageAlert({
        visible: true,
        variant: "success",
        title: "Booking confirmed",
        description: "The badminton booking was confirmed successfully.",
      });

      setSelectedSlotsByCourt({});
      closeBookingModal();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unable to confirm the booking.";

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Confirmation failed",
        description: message,
      });
    } finally {
      setLoading(false);
      setCustomerName('')
      setCustomerPhone('')
      // Reset selected slots when closing the modal
      setSelectedSlotsByCourt({})
      // update slots availability after closing the modal
      const selectedDateString = displayedDays[selectedDate]?.fullDate;
      if (selectedDateString) {
        courts.forEach(async (court) => {
          const slots = await getCourtSlotsAvailability(
            court.id,
            selectedDateString,
          );
          const formattedSlots = (Array.isArray(slots) ? slots : []).map(
            (slot: any) => ({
              id: slot.id,
              courtId: slot.courtId,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isActive: slot.isActive,
              isBooked: slot.isBooked,
              price: slot.price,
              label: formatSlotLabel(slot.startTime, slot.endTime),
              available: slot.isActive && !slot.isBooked,
            })
          );
          setCourtSlots((prev) => ({
            ...prev,
            [court.id]: formattedSlots,
          }));
        });
      }
    }
  };

  const toggleSlot = (courtId: string, index: number) => {
    const court = courts.find((item) => item.id === courtId);
    const slots = courtSlots[courtId] ?? [];
    const slot = slots[index];

    if (!court || court.status === 2 || !slot || !slot.available) {
      return;
    }

    setSelectedSlotsByCourt((currentSelections) => {
      const selectedForCourt = currentSelections[courtId] ?? [];

      if (selectedForCourt.includes(index)) {
        const sorted = [...selectedForCourt].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        if (index !== min && index !== max) {
          return currentSelections;
        }

        const nextSelections = selectedForCourt.filter(
          (slotIndex) => slotIndex !== index
        );

        if (nextSelections.length === 0) {
          const nextSelectionsByCourt = { ...currentSelections };
          delete nextSelectionsByCourt[courtId];
          return nextSelectionsByCourt;
        }

        return {
          ...currentSelections,
          [courtId]: nextSelections,
        };
      }

      if (selectedForCourt.length === 0) {
        return {
          ...currentSelections,
          [courtId]: [index],
        };
      }

      const sorted = [...selectedForCourt].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const isAdjacent = index === min - 1 || index === max + 1;

      if (!isAdjacent) {
        return currentSelections;
      }

      return {
        ...currentSelections,
        [courtId]: [...selectedForCourt, index],
      };
    });
  };

  const selectedSlotDetails = useMemo<SelectedSlotDetail[]>(() => {
    return courts.flatMap((court) => {
      const selectedIndexes = selectedSlotsByCourt[court.id] ?? [];
      const slots = courtSlots[court.id] ?? [];

      return selectedIndexes
        .slice()
        .sort((a, b) => a - b)
        .map((slotIndex) => {
          const slot = slots[slotIndex];

          if (!slot) {
            return null;
          }

          return {
            courtId: court.id,
            courtName: court.name,
            slotId: slot.id,
            slotIndex,
            label: slot.label,
            price: slot.price > 0 ? slot.price : court.price,
          };
        })
        .filter((item): item is SelectedSlotDetail => item !== null);
    });
  }, [courts, courtSlots, selectedSlotsByCourt]);

  const subtotal = selectedSlotDetails.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;
  const selectedDateInfo = displayedDays[selectedDate] ?? displayedDays[0];
  const selectedCourtNames = Array.from(
    new Set(selectedSlotDetails.map((item) => item.courtName))
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fafafa] via-white to-[#fafafa] py-10 sm:py-14 lg:py-20">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-100/30 blur-3xl" />
      </div>

      {loading && createPortal(
        <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl border border-white/20 bg-white/10 p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
            </div>
            <p className="mt-4 text-base font-bold text-white">Processing your booking</p>
            <p className="mt-1 text-sm text-white/70">Please wait a moment...</p>
          </div>
        </div>,
        document.body
      )}

      {pageAlert.visible && (
        <div className="relative z-[100]">
          <Alert
            variant={pageAlert.variant as any}
            title={pageAlert.title}
            description={pageAlert.description}
            onClose={() => setPageAlert((s) => ({ ...s, visible: false }))}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mx-auto mb-8 max-w-4xl text-center sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-amber-700 shadow-sm sm:px-4 sm:text-sm">
            <Sparkles size={15} />
            Premium court booking
          </div>

          <h1 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#D48A52] bg-clip-text text-4xl font-black leading-[1.05] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Book Your Court
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            Choose your date, pick an available court slot, and reserve your
            badminton session in just a few steps.
          </p>

          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm">
              <Trophy size={17} className="shrink-0 text-amber-600" />
              <span className="text-sm font-bold text-gray-800">Premium courts</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm">
              <Star size={17} className="shrink-0 text-amber-600" />
              <span className="text-sm font-bold text-gray-800">4.9 player rating</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm">
              <ShieldCheck size={17} className="shrink-0 text-amber-600" />
              <span className="text-sm font-bold text-gray-800">Secure booking</span>
            </div>
          </div>
        </div>

        {/* Date selector */}
        <div className="mb-7 overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_12px_45px_rgba(0,0,0,0.06)] sm:mb-8">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <CalendarDays size={19} />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 sm:text-lg">Choose your date</h2>
                <p className="text-xs text-gray-500 sm:text-sm">Select a working day to see live court availability.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock3 size={14} />
              Live availability
            </div>
          </div>

          <div className="overflow-x-auto px-3 py-4 sm:px-5">
            <div className="flex min-w-max gap-2.5 sm:grid sm:min-w-0 sm:grid-cols-7 sm:gap-3">
              {displayedDays.map((item, index) => (
                <button
                  key={item.fullDate}
                  type="button"
                  onClick={() => setSelectedDate(index)}
                  className={`group min-w-[76px] cursor-pointer rounded-2xl border p-3 text-center transition-all duration-300 sm:min-w-0 sm:p-4 ${
                    selectedDate === index
                      ? "scale-[1.02] border-amber-500 bg-[#A65A2A] text-white shadow-lg shadow-amber-900/15"
                      : "border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md"
                  }`}
                >
                  <p className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    selectedDate === index ? "text-white/80" : "text-gray-400"
                  }`}>
                    {item.day}
                  </p>
                  <p className="mt-0.5 text-2xl font-black sm:text-3xl">{item.date}</p>
                  <p className={`text-[10px] font-bold uppercase ${
                    selectedDate === index ? "text-white/80" : "text-gray-400"
                  }`}>
                    {item.month}
                  </p>
                  {item.isToday && (
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      selectedDate === index ? "bg-white/15 text-white" : "bg-amber-50 text-amber-700"
                    }`}>
                      TODAY
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected date heading */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Court availability</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {selectedDateInfo?.date} {selectedDateInfo?.month}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Info size={14} className="text-amber-600" />
            Select adjacent slots for each court
          </div>
        </div>

        {/* Courts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {courts.map((courtItem) => {
            const slots = courtSlots[courtItem.id] ?? [];
            const selectedSlots = selectedSlotsByCourt[courtItem.id] ?? [];
            const isActiveCourt = selectedSlots.length > 0;

            return (
              <article
                key={courtItem.id}
                className={`group relative overflow-hidden rounded-[1.75rem] border bg-white transition-all duration-300 ${
                  isActiveCourt
                    ? "border-amber-500 shadow-[0_18px_55px_rgba(166,90,42,0.14)] ring-2 ring-amber-100"
                    : "border-gray-200 shadow-[0_10px_35px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.09)]"
                } ${courtItem.status === 2 ? "opacity-60 grayscale" : ""}`}
              >
                {/* Court image */}
                <div className="relative h-48 overflow-hidden sm:h-56">
                  <img
                    src={courtItem.image}
                    alt={courtItem.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm ${
                      courtItem.status === 2 ? "bg-red-500/90" : "bg-green-500/90"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {courtItem.status === 2 ? "Temporarily Closed" : "Available"}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                    <div>
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                        KVK Arena
                      </p>
                      <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {courtItem.name}
                      </h3>
                    </div>
                    <div className="shrink-0 rounded-2xl bg-black/30 px-3 py-2 text-right backdrop-blur-md">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Per slot</p>
                      <p className="text-sm font-black sm:text-base">
                        LKR {courtItem.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {/* Features */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    {courtItem.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700"
                      >
                        <CircleCheck size={12} />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Slot heading */}
                  <div className="mb-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} className="text-amber-600" />
                      <h4 className="text-sm font-black text-gray-900">Available time slots</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Adjacent selection
                    </span>
                  </div>

                  {/* Slots */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                    {slots.length > 0 ? (
                      slots.map((slot, index) => {
                        const disabled =
                          courtItem.status === 2 ||
                          !slot.available ||
                          isPastSlot(slot.label, selectedDate);
                        const isSelected = selectedSlots.includes(index);

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleSlot(courtItem.id, index)}
                            className={`relative min-h-[58px] overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-all duration-200 ${
                              disabled
                                ? "cursor-not-allowed border-red-100 bg-red-50/80 opacity-55"
                                : isSelected
                                  ? "cursor-pointer border-amber-500 bg-[#A65A2A] text-white shadow-md shadow-amber-900/15"
                                  : "cursor-pointer border-gray-200 bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <Clock3 size={13} className={isSelected ? "text-white/80" : "text-amber-600"} />
                              {isSelected && <CheckCircle2 size={14} />}
                            </div>
                            <p className={`mt-1.5 text-[10px] font-extrabold leading-4 sm:text-[10px] ${
                              isSelected ? "text-white" : "text-gray-800"
                            }`}>
                              {slot.label}
                            </p>
                            <p className={`mt-0.5 text-[9px] font-semibold ${
                              disabled
                                ? "text-red-400"
                                : isSelected
                                  ? "text-white/70"
                                  : "text-gray-400"
                            }`}>
                              {disabled ? "Unavailable" : "Available"}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full flex min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-5 text-center">
                        <div>
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Clock3 size={18} className="text-amber-600" />
                          </div>
                          <p className="mt-3 text-sm font-bold text-gray-700">Loading slots...</p>
                          <p className="mt-1 text-xs text-gray-400">Checking live availability</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isActiveCourt && (
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50/70 px-3.5 py-3">
                      <span className="text-xs font-bold text-amber-900">
                        {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
                      </span>
                      <span className="text-xs font-black text-amber-700">
                        LKR {selectedSlotDetails
                          .filter((item) => item.courtId === courtItem.id)
                          .reduce((sum, item) => sum + item.price, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Booking summary */}
        <div className="mt-6 rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_12px_45px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 sm:text-xl">Booking summary</h2>
                <p className="text-xs text-gray-500 sm:text-sm">Review your selection before continuing.</p>
              </div>
            </div>

            <div className="rounded-full bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-600">
              {selectedSlotDetails.length} slot{selectedSlotDetails.length !== 1 ? "s" : ""} selected
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
            <div className="p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Court</p>
                  <p className="mt-1 text-sm font-black text-gray-900">
                    {selectedCourtNames.length > 0 ? selectedCourtNames.join(", ") : "Select slots"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Date</p>
                  <p className="mt-1 text-sm font-black text-gray-900">
                    {selectedDateInfo?.date} {selectedDateInfo?.month}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Slots</p>
                  <p className="mt-1 text-sm font-black text-gray-900">
                    {selectedSlotDetails.length}
                  </p>
                </div>
              </div>

              {selectedSlotDetails.length > 0 ? (
                <div className="mt-4 max-h-64 space-y-2 overflow-auto rounded-2xl border border-gray-100 bg-[#fcfaf8] p-3">
                  {selectedSlotDetails.map((slot) => (
                    <div
                      key={`${slot.courtId}-${slot.slotId}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                          <Clock3 size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-gray-900 sm:text-sm">{slot.courtName}</p>
                          <p className="truncate text-[11px] text-gray-500 sm:text-xs">{slot.label}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-xs font-black text-amber-700 sm:text-sm">
                        LKR {slot.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-5 text-center">
                  <p className="text-sm font-bold text-gray-600">No slots selected yet</p>
                  <p className="mt-1 text-xs text-gray-400">Choose one or more adjacent slots above to continue.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-gradient-to-b from-[#fffaf5] to-[#f8eee5] p-4 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900">LKR {subtotal.toLocaleString()}</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#ead8c8] pt-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total</p>
                  <p className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
                    LKR {total.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <CreditCard size={19} className="text-amber-700" />
                </div>
              </div>

              <button
                type="button"
                disabled={selectedSlotDetails.length === 0}
                onClick={handleBookingMultipleSlots}
                className="group relative mt-5 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#A65A2A] via-[#D4A76A] to-[#A65A2A] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(166,90,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(166,90,42,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <CreditCard size={17} />
                <span className="relative z-10">Proceed To Payment</span>
                <ChevronRight size={17} className="relative z-10 transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>

              <div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-gray-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
                <span>Your selected slots will be held while you complete the booking.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking guidance */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-amber-950">Quick booking tip</p>
            <p className="mt-0.5 text-xs leading-5 text-amber-900/70 sm:text-sm">
              Pick slots on any court to build your booking. Within each court,
              selections need to stay adjacent.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {isBookingModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999999998] flex items-center justify-center bg-[#24170f]/70 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-6">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(54,30,15,0.3)] sm:max-h-[90vh] sm:rounded-[2rem]">
            <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-[#fff8ef] via-white to-[#fff4e8] px-4 py-4 sm:px-7 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A65A2A]">
                    <CreditCard size={13} />
                    Booking checkout
                  </div>
                  <h3 className="mt-1.5 text-xl font-black tracking-tight text-gray-900 sm:text-3xl">
                    Review your booking
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Add your contact details and confirm the selected slots.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal()
                    setCustomerName('')
                    setCustomerPhone('')
                    setSelectedSlotsByCourt({})
                    const selectedDateString = displayedDays[selectedDate]?.fullDate;
                    if (selectedDateString) {
                      courts.forEach(async (court) => {
                        const slots = await getCourtSlotsAvailability(
                          court.id,
                          selectedDateString,
                        );
                        const formattedSlots = (Array.isArray(slots) ? slots : []).map(
                          (slot: any) => ({
                            id: slot.id,
                            courtId: slot.courtId,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            isActive: slot.isActive,
                            isBooked: slot.isBooked,
                            price: slot.price,
                            label: formatSlotLabel(slot.startTime, slot.endTime),
                            available: slot.isActive && !slot.isBooked,
                          })
                        );
                        setCourtSlots((prev) => ({
                          ...prev,
                          [court.id]: formattedSlots,
                        }));
                      });
                    }
                  }}
                  aria-label="Close booking review"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-[#A65A2A] hover:bg-[#fff8ef] hover:text-[#A65A2A] sm:h-10 sm:w-10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto text-[10px] font-bold sm:text-xs">
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#A65A2A] px-3 py-1.5 text-white">
                  <CircleCheck size={13} /> Slots selected
                </span>
                <ChevronRight size={13} className="shrink-0 text-gray-300" />
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-500">
                  <Users size={13} /> Your details
                </span>
                <ChevronRight size={13} className="shrink-0 text-gray-300" />
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-500">
                  <CreditCard size={13} /> Confirm
                </span>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-7 sm:py-6">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                      <CalendarDays size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Booking date</p>
                      <p className="mt-0.5 text-base font-black text-gray-900 sm:text-lg">
                        {selectedDateInfo?.date} {selectedDateInfo?.month}
                      </p>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                    <div className="mb-4">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[#A65A2A]">Contact details</p>
                      <h4 className="mt-1 text-lg font-black text-gray-900">Who should receive the booking SMS?</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-gray-700">Customer Name</span>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(event) => setCustomerName(event.target.value)}
                          placeholder="Enter customer name"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-gray-700">Customer Mobile No</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="07[0-9]{8}"
                          aria-invalid={Boolean(customerPhoneError)}
                          value={customerPhone}
                          onChange={(event) => {
                            setCustomerPhone(
                              event.target.value.replace(/\D/g, "").slice(0, 10)
                            );
                            setCustomerPhoneError("");
                          }}
                          placeholder="07X XXX XXXX"
                          className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:ring-4 focus:ring-amber-100 ${
                            customerPhoneError
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-amber-500"
                          }`}
                        />
                        <span className="mt-1.5 block text-xs text-gray-500">
                          Enter 10 digits starting with 07.
                        </span>
                        {customerPhoneError && (
                          <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
                            {customerPhoneError}
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3.5 text-xs leading-5 text-amber-900">
                      <Info size={15} className="mt-0.5 shrink-0 text-amber-700" />
                      <span>Please enter the correct mobile number because the booking ID will be sent by SMS.</span>
                    </div>
                  </div>

                  {/* Selected slots */}
                  <div className="rounded-2xl border border-gray-100 bg-[#fcfaf8] p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Your selection</p>
                        <h4 className="mt-1 text-base font-black text-gray-900">Selected slots</h4>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-gray-500 shadow-sm">
                        {selectedSlotDetails.length} slot(s)
                      </span>
                    </div>

                    <div className="max-h-52 space-y-2 overflow-auto pr-1">
                      {selectedSlotDetails.map((slot) => (
                        <div
                          key={`${slot.courtId}-${slot.slotId}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                              <Clock3 size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-gray-900">{slot.courtName}</p>
                              <p className="truncate text-[11px] text-gray-500">{slot.label}</p>
                            </div>
                          </div>
                          <p className="shrink-0 text-xs font-black text-amber-700">
                            LKR {slot.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout total */}
                <div className="h-fit rounded-2xl border border-[#ead8c8] bg-gradient-to-b from-[#fffaf5] to-[#f8eee5] p-4 sm:p-5 lg:sticky lg:top-0">
                  <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#A65A2A]">Order total</p>
                    <h4 className="mt-1 text-xl font-black text-gray-900">Booking payment</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">Court(s)</span>
                      <span className="max-w-[60%] text-right font-bold text-gray-900">
                        {selectedCourtNames.length > 0 ? selectedCourtNames.join(", ") : "Select slots"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-bold text-gray-900">
                        {selectedDateInfo?.date} {selectedDateInfo?.month}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">Slots</span>
                      <span className="font-bold text-gray-900">{selectedSlotDetails.length}</span>
                    </div>

                    <div className="border-t border-[#ead8c8] pt-4">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-gray-900">LKR {subtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <span className="text-sm font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-amber-700">LKR {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleConfirmBooking}
                    className="mt-5 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#A65A2A] via-[#D4A76A] to-[#A65A2A] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(166,90,42,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(166,90,42,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CreditCard size={17} />
                    {loading ? "Processing..." : "Confirm Booking"}
                  </button>

                  <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-gray-500">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
                    <span>Your selected booking is being held while the confirmation is processed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
