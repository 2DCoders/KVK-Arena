import { useEffect, useMemo, useState } from "react";
import courtImg from "@/assets/court.png";
import {
  CalendarDays,
  CheckCircle2,
  Trophy,
  Users,
  Star,
} from "lucide-react";
import { getCourts } from "@/services/court-api";
import { bookingSlots } from "@/services/booking-api";
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

      setHoldIds(holdIds);
      setSelectedSlotsByCourt({});
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] via-white to-[#fafafa] py-20">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

      {loading && createPortal(
        <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
            <p className="text-sm text-white font-medium">Loading</p>
          </div>
        </div>,
        document.body
      )}

      {holdIds.length > 0 && (
        <></>
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

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            🏸 Online Court Booking
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#D48A52] bg-clip-text text-5xl font-black text-transparent md:text-5xl">
            Book Your Court
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Reserve your preferred badminton court in seconds and enjoy a
            premium playing experience at KVK Arena.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Trophy size={18} className="text-amber-600" />
              <span className="font-semibold">2 Premium Courts</span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Star size={18} className="text-amber-600" />
              <span className="font-semibold">4.9 Rating</span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Users size={18} className="text-amber-600" />
              <span className="font-semibold">500+ Players</span>
            </div>
          </div>
        </div>

        <div className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="text-amber-600" />
            <h3 className="text-lg font-black">Select Date</h3>
          </div>

          <div className="grid grid-cols-7 gap-4 p-2">
            {displayedDays.map((item, index) => (
              <button
                key={item.fullDate}
                onClick={() => setSelectedDate(index)}
                className={`rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${selectedDate === index
                  ? "scale-105 border-amber-500 bg-[#A65A2A] text-white shadow-xl"
                  : "border-gray-200 bg-white hover:border-amber-300"
                  }`}
              >
                <p className="text-xs font-bold">{item.day}</p>
                <p className="text-3xl font-black">{item.date}</p>
                <p className="text-xs">{item.month}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch mb-5">
          {courts.map((courtItem) => {
            const slots = courtSlots[courtItem.id] ?? [];
            const selectedSlots = selectedSlotsByCourt[courtItem.id] ?? [];
            const isActiveCourt = selectedSlots.length > 0;

            return (
              <div
                key={courtItem.id}
                className={`group relative overflow-hidden rounded-3xl border bg-white transition-all duration-500 ${isActiveCourt
                  ? "border-amber-500 shadow-2xl ring-4 ring-amber-200"
                  : "border-gray-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                  } ${courtItem.status === 2 ? "opacity-60 grayscale" : ""}`}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={courtItem.image}
                    alt={courtItem.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <span
                    className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white ${courtItem.status === 2 ? "bg-red-500" : "bg-green-500"
                      }`}
                  >
                    {courtItem.status === 2 ? "Temporarily Closed" : "Available"}
                  </span>

                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-black">{courtItem.name}</h4>
                    <p className="text-lg font-bold">
                      LKR {courtItem.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex flex-wrap gap-2">
                    {courtItem.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h5 className="text-sm font-black text-gray-900">
                        Available Slots
                      </h5>
                      <span className="text-xs font-semibold text-gray-500">
                        Adjacent slots only
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
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
                              disabled={disabled}
                              onClick={() => toggleSlot(courtItem.id, index)}
                              className={`rounded-2xl border p-3 text-left text-sm transition-all duration-300 ${disabled
                                ? "cursor-not-allowed border-red-200 bg-red-50 opacity-60"
                                : isSelected
                                  ? "border-amber-500 cursor-pointer bg-[#A65A2A] text-white shadow-lg"
                                  : "border-gray-200 cursor-pointer hover:border-amber-300 hover:shadow-md"
                                }`}
                            >
                              <p className="font-semibold text-[11px] whitespace-nowrap">
                                {slot.label}
                              </p>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                          Loading slots...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-1">

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                <h3 className="text-lg font-black">Booking Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Courts</span>
                  <span className="text-right font-semibold">
                    {selectedCourtNames.length > 0
                      ? selectedCourtNames.join(", ")
                      : "Select slots"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {selectedDateInfo?.date} {selectedDateInfo?.month}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Selected Slots</span>
                  <span className="text-right font-semibold">
                    {selectedSlotDetails.length}
                  </span>
                </div>

                {selectedSlotDetails.length > 0 && (
                  <div className="max-h-72 space-y-2 overflow-auto rounded-2xl bg-gray-50 p-4">
                    {selectedSlotDetails.map((slot) => (
                      <div
                        key={`${slot.courtId}-${slot.slotId}`}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {slot.courtName}
                          </p>
                          <p className="text-gray-500">{slot.label}</p>
                        </div>

                        <p className="whitespace-nowrap font-semibold text-amber-700">
                          LKR {slot.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>LKR {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="mt-4 flex justify-between text-xl font-black">
                    <span>Total</span>
                    <span className="text-amber-700">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                disabled={selectedSlotDetails.length === 0}
                onClick={() => {
                  setIsBookingModalOpen(true)
                  handleBookingMultipleSlots()
                }}
                className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#A65A2A] via-[#D4A76A] to-[#A65A2A] px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(201,119,58,0.35)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10">Proceed To Payment</span>

                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              </button>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-6 text-sm text-amber-900">
              Pick slots on any court to build your booking. Within each court,
              selections still need to stay adjacent.
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999999998] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Confirm Booking
                </p>
                <h3 className="mt-1 text-2xl font-black text-gray-900">
                  Review your badminton booking
                </h3>
              </div>

              <button
                type="button"
                onClick={closeBookingModal}
                className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-800"
              >
                Close
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      Booking Date
                    </p>
                    <p className="mt-1 text-lg font-black text-gray-900">
                      {selectedDateInfo?.date} {selectedDateInfo?.month}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">
                        Customer Name
                      </span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="Enter customer name"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">
                        Customer Mobile No
                      </span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                        placeholder="07X XXX XXXX"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
                    Please add correct mobile no because booking id goes to mobile no as SMS.
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black text-gray-900">
                        Booking Summary
                      </h4>
                      <span className="text-xs font-semibold text-gray-500">
                        {selectedSlotDetails.length} slot(s)
                      </span>
                    </div>

                    <div className="max-h-56 space-y-2 overflow-auto pr-1">
                      {selectedSlotDetails.map((slot) => (
                        <div
                          key={`${slot.courtId}-${slot.slotId}`}
                          className="flex items-start justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {slot.courtName}
                            </p>
                            <p className="text-gray-500">{slot.label}</p>
                          </div>

                          <p className="whitespace-nowrap font-semibold text-amber-700">
                            LKR {slot.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Courts</span>
                    <span className="text-right text-sm font-semibold text-gray-900">
                      {selectedCourtNames.length > 0
                        ? selectedCourtNames.join(", ")
                        : "Select slots"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900">
                      LKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-gray-200 pt-4">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-black text-amber-700">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleBookingMultipleSlots}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#A65A2A] via-[#D4A76A] to-[#A65A2A] px-6 py-4 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Processing..." : "Pay & Confirm"}
                  </button>

                  <button
                    type="button"
                    onClick={closeBookingModal}
                    className="w-full rounded-2xl border border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-white"
                  >
                    Back
                  </button>
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
