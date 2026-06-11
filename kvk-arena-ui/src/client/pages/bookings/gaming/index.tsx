import { useMemo, useState } from "react";
import {
  Monitor,
  Gamepad2,
  Trophy,
  Film,
  Minus,
  Plus,
} from "lucide-react";

const services = [
  {
    id: "pc",
    title: "PC Games",
    icon: Monitor,
    price: 1000,
    description: "High-end gaming PCs",
  },
  {
    id: "ps5",
    title: "PS5 Games",
    icon: Gamepad2,
    price: 1500,
    description: "2 Consoles Included",
  },
  {
    id: "pool",
    title: "Pool Table",
    icon: Trophy,
    price: 1200,
    description: "Professional billiards tables",
  },
  {
    id: "movie",
    title: "Movie Room",
    icon: Film,
    price: 2500,
    description: "Private cinema experience",
  },
];

const slots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export default function BookingGaming() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [extraConsoles, setExtraConsoles] = useState(0);

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const total = useMemo(() => {
    if (!selectedService) return 0;

    let amount = selectedService.price;

    if (selectedService.id === "ps5") {
      amount += extraConsoles * 500;
    }

    return amount;
  }, [selectedService, extraConsoles]);

  return (
    <section className="bg-gray-50 py-12">
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
              <h3 className="text-lg font-semibold mb-3">
                Select Service
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedDate(null);
                        setSelectedSlot("");
                        setExtraConsoles(0);
                      }}
                      className={`text-left cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        selectedService?.id === service.id
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
              className={`transition-all ${
                !selectedService
                  ? "opacity-40 pointer-events-none"
                  : ""
              }`}
            >
              <h3 className="text-lg font-semibold mb-3">
                Select Date
              </h3>

              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(index)}
                    className={`h-20 cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center transition ${
                      selectedDate === index
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <p className="text-[10px]">
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>

                    <p className="text-lg font-bold">
                      {date.getDate()}
                    </p>

                    <p className="text-[10px]">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slots */}
            <div
              className={`transition-all ${
                selectedDate === null
                  ? "opacity-40 pointer-events-none"
                  : ""
              }`}
            >
              <h3 className="text-lg font-semibold mb-3">
                Select Time Slot
              </h3>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`h-10 cursor-pointer rounded-lg border text-sm font-medium transition ${
                      selectedSlot === slot
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-200 bg-white hover:border-red-300"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* PS5 Extras */}
            {selectedService?.id === "ps5" && (
              <div
                className={`bg-white border cursor-pointer border-gray-200 rounded-2xl p-4 transition-all ${
                  !selectedSlot
                    ? "opacity-40 pointer-events-none"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Additional Consoles
                    </h3>

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
                      setExtraConsoles(
                        Math.max(0, extraConsoles - 1)
                      )
                    }
                    className="w-9 h-9 rounded-lg border flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="text-xl font-bold w-8 text-center">
                    {extraConsoles}
                  </span>

                  <button
                    onClick={() =>
                      setExtraConsoles(
                        Math.min(2, extraConsoles + 1)
                      )
                    }
                    className="w-9 h-9 rounded-lg border flex items-center justify-center"
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
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-5">
                Booking Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Service
                  </p>
                  <p className="font-semibold">
                    {selectedService?.title || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold">
                    {selectedDate !== null
                      ? dates[selectedDate].toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Time Slot
                  </p>
                  <p className="font-semibold">
                    {selectedSlot || "-"}
                  </p>
                </div>

                {selectedService?.id === "ps5" && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Additional Consoles
                    </p>
                    <p className="font-semibold">
                      {extraConsoles}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-red-600">
                      Rs. {total}
                    </span>
                  </div>
                </div>

                <button
                  disabled={
                    !selectedService ||
                    selectedDate === null ||
                    !selectedSlot
                  }
                  className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
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