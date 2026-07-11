import { useEffect, useMemo, useState } from "react";
import { Monitor, Gamepad2, Trophy, Film, Minus, Plus } from "lucide-react";
import { getNextWorkingDays } from "@/services/holidays-api";

const services = [
  {
    id: "pc",
    title: "PC Games",
    icon: Monitor,
    price: 1000,
    description: "High-end gaming PCs with latest titles",
    resources: ["PC 1", "PC 2"],
  },
  {
    id: "ps5",
    title: "PS5 Games",
    icon: Gamepad2,
    price: 1500,
    description: "2 PS5 consoles with popular games",
    resources: ["PS5 1", "PS5 2", "PS5 3"],
  },
  {
    id: "pool",
    title: "Pool Table",
    icon: Trophy,
    price: 1200,
    description: "Enjoy a game of pool with friends",
    resources: ["Table 1", "Table 2"],
  },
  {
    id: "movie",
    title: "Movie Room",
    icon: Film,
    price: 2500,
    description: "Private movie room with big screen and surround sound",
    resources: ["Room 1", "Room 2"],
  },
];

const slots = [
  { start: 9, end: 10 },
  { start: 10, end: 11 },
  { start: 11, end: 12 },
  { start: 12, end: 13 },
  { start: 13, end: 14 },
  { start: 14, end: 15 },
  { start: 15, end: 16 },
  { start: 16, end: 17 },
  { start: 17, end: 18 },
  { start: 18, end: 19 },
  { start: 19, end: 20 },
  { start: 20, end: 21 },
];

const existingBookings = [
  {
    serviceId: "pc",
    resourceId: "PC 1",
    date: "2026-06-11",
    slotIndex: 1,
  },
  {
    serviceId: "pc",
    resourceId: "PC 2",
    date: "2026-06-11",
    slotIndex: 1,
  },

  {
    serviceId: "ps5",
    resourceId: "PS5 1",
    date: "2026-06-11",
    slotIndex: 3,
  },
];

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}.00 ${period}`;
};

export default function BookingGaming() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [extraConsoles, setExtraConsoles] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<any[]>([]);

  const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const startDate = yesterday.toISOString().split("T")[0];

  useEffect(() => {
    const fetchWorkingDays = async () => {
      try {
        const res = await getNextWorkingDays(startDate, 7);

        const formattedDates = res.map(
          (dateStr: string) => {
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
              isToday:
                date.toDateString() === today.toDateString(),
            };
          }
        );

        setWorkingDays(formattedDates);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWorkingDays();
  }, []);

  const toggleSlot = (index: number) => {
    const availability = getSlotAvailability(index);

    if (availability.full) {
      return;
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([index]);
      return;
    }

    const sorted = [...selectedSlots].sort((a, b) => a - b);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Remove selected slot
    if (selectedSlots.includes(index)) {
      setSelectedSlots(selectedSlots.filter((i) => i !== index));
      return;
    }

    // Only allow adjacent extension
    if (index === min - 1 || index === max + 1) {
      setSelectedSlots([...selectedSlots, index]);
    }
  };

  const duration = selectedSlots.length;

  const selectedTimeRange = useMemo(() => {
    if (selectedSlots.length === 0) return "-";

    const sorted = [...selectedSlots].sort((a, b) => a - b);

    const firstSlot = slots[sorted[0]];
    const lastSlot = slots[sorted[sorted.length - 1]];

    return `${formatHour(firstSlot.start)} - ${formatHour(lastSlot.end)}`;
  }, [selectedSlots]);

  const selectedDateString =
    selectedDate !== null
      ? workingDays[selectedDate]?.fullDate.split("T")[0]
      : null;

  const isSlotDisabled = (
    slotStart: number,
    dateIndex: number | null,
  ) => {
    // Only disable for today
    if (dateIndex !== 0) return false;

    const nowInSriLanka = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      }),
    );

    const currentHour = nowInSriLanka.getHours();
    const currentMinute = nowInSriLanka.getMinutes();

    const currentTime = currentHour + currentMinute / 60;

    // Disable if slot already started
    return slotStart <= currentTime;
  };

  const getSlotAvailability = (slotIndex: number) => {
    if (!selectedService || !selectedDateString) {
      return {
        availableResources: [],
        full: false,
      };
    }

    const availableResources = selectedService.resources.filter(
      (resource: string) => {
        const booking = existingBookings.find(
          (b) =>
            b.serviceId === selectedService.id &&
            b.resourceId === resource &&
            b.date === selectedDateString &&
            b.slotIndex === slotIndex,
        );

        return !booking;
      },
    );

    return {
      availableResources,
      full: availableResources.length === 0,
    };
  };

  const total = useMemo(() => {
    if (!selectedService) return 0;

    let amount =
      selectedService.price *
      selectedSlots.length *
      Math.max(selectedResources.length, 1);

    if (selectedService.id === "ps5") {
      amount += extraConsoles * 500 * selectedSlots.length;
    }

    return amount;
  }, [
    selectedService,
    selectedSlots,
    selectedResources,
    extraConsoles,
  ]);

  return (
    <section className="bg-gray-50 pt-25 pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium text-sm">
            Reservation
          </span>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
            Book Your Experience
          </h2>

          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Select your service, date and time slot to complete booking.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Service</h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedDate(null);
                        setSelectedSlots([]);
                        setExtraConsoles(0);
                        setSelectedResources([]);
                      }}
                      className={`text-left cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedService?.id === service.id
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-red-300"
                        }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-red-600" />
                      </div>

                      <h4 className="font-bold text-sm text-gray-900">
                        {service.title}
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        {service.description}
                      </p>

                      <div className="mt-2 font-semibold text-red-600 text-sm">
                        Rs. {service.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div
              className={`transition-all ${!selectedService ? "opacity-40 pointer-events-none" : ""
                }`}
            >
              <h3 className="text-lg font-semibold mb-3">Select Date</h3>

              {workingDays.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Loading available dates...
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {workingDays.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(index);
                        setSelectedSlots([]);
                        setSelectedResources([]);
                      }}
                      className={`h-20 cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center transition ${selectedDate === index
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-200 bg-white hover:border-red-300"
                        }`}
                    >
                      {date.isToday && (
                        <div className="text-[9px] font-bold mb-1">
                          TODAY
                        </div>
                      )}

                      <p className="text-[10px] font-semibold">
                        {date.day}
                      </p>

                      <p className="text-lg font-bold">
                        {date.date}
                      </p>

                      <p className="text-[10px]">
                        {date.month}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Slots */}
            <div
              className={`transition-all ${selectedDate === null ? "opacity-40 pointer-events-none" : ""
                }`}
            >
              <h3 className="text-lg font-semibold mb-3">Select Time Slot</h3>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {slots.map((slot, index) => {
                  const availability = getSlotAvailability(index);

                  const disabled =
                    isSlotDisabled(slot.start, selectedDate) ||
                    availability.full;

                  const selected = selectedSlots.includes(index);

                  return (
                    <button
                      key={index}
                      disabled={disabled}
                      onClick={() => {
                        toggleSlot(index);
                        setSelectedResources([]);
                      }}
                      className={`h-16 cursor-pointer rounded-lg border text-xs font-medium transition
                      ${selected
                          ? "bg-red-500 border-red-500 text-white"
                          : availability.full
                            ? "bg-gray-200 border-gray-300 text-gray-500"
                            : "bg-white border-gray-200 hover:border-red-300"
                        }
                      ${disabled
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                        }
                    `}
                    >
                      <div className="leading-tight">
                        <div>{formatHour(slot.start)}</div>

                        <div>{formatHour(slot.end)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedService && selectedSlots.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Resource</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedService.resources.map((resource: string) => {
                    const allSelectedSlotsAvailable = selectedSlots.every(
                      (slotIndex) => {
                        const availability = getSlotAvailability(slotIndex);

                        return availability.availableResources.includes(
                          resource,
                        );
                      },
                    );

                    const selected = selectedResources.includes(resource);

                    return (
                      <button
                        key={resource}
                        disabled={!allSelectedSlotsAvailable}
                        onClick={() => {
                          if (selected) {
                            setSelectedResources(
                              selectedResources.filter((r) => r !== resource),
                            );
                          } else {
                            setSelectedResources([
                              ...selectedResources,
                              resource,
                            ]);
                          }
                        }}
                        className={`h-12 cursor-pointer rounded-xl border font-medium transition
                        ${selected
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white border-gray-200"
                          }
                        ${!allSelectedSlotsAvailable
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                          }
                      `}
                      >
                        {resource}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PS5 Extras */}
            {selectedService?.id === "ps5" && (
              <div
                className={`bg-white border cursor-pointer border-gray-200 rounded-2xl p-4 transition-all ${selectedSlots.length === 0
                  ? "opacity-40 pointer-events-none"
                  : ""
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Additional Consoles</h3>

                    <p className="text-xs text-gray-500">
                      2 Consoles Included Free
                    </p>
                  </div>

                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
                    Max +2
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      setExtraConsoles(Math.max(0, extraConsoles - 1))
                    }
                    className="w-9 h-9 cursor-pointer rounded-lg border flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="text-xl font-bold w-8 text-center">
                    {extraConsoles}
                  </span>

                  <button
                    onClick={() =>
                      setExtraConsoles(Math.min(2, extraConsoles + 1))
                    }
                    className="w-9 h-9 cursor-pointer rounded-lg border flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Rs. 500 per additional console
                </p>
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div>
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-10">
              <h3 className="text-xl font-bold mb-5">Booking Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-semibold">
                    {selectedService?.title || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Selected Resources</p>

                  <p className="font-semibold">
                    {selectedResources.length > 0
                      ? selectedResources.join(", ")
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold">
                    {selectedDate !== null
                      ? new Date(
                        workingDays[selectedDate]?.fullDate
                      ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Time Range</p>
                  <p className="font-semibold">{selectedTimeRange}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">
                    {duration > 0 ? `${duration} Hour(s)` : "-"}
                  </p>
                </div>

                {selectedService?.id === "ps5" && (
                  <div>
                    <p className="text-xs text-gray-500">Additional Consoles</p>
                    <p className="font-semibold">{extraConsoles}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>

                    <span className="text-xl font-bold text-red-600">
                      Rs. {total}
                    </span>
                  </div>
                </div>

                <button
                  disabled={
                    !selectedService ||
                    selectedDate === null ||
                    selectedSlots.length === 0
                  }
                  className="w-full cursor-pointer h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
