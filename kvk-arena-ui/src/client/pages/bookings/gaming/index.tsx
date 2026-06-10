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
    title: "Private Movie Room",
    icon: Film,
    price: 2500,
    description: "Private cinema experience",
  },
];

const slots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

export default function BookingGaming() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
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
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium">
            Reservation
          </span>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-5">
            Book Your Experience
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Select a service, choose a date and time slot, then confirm your
            reservation.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left */}
          <div className="space-y-10">
            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-5">
                Select Service
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
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
                      className={`group text-left rounded-3xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${
                        selectedService?.id === service.id
                          ? "border-red-500 bg-red-50 shadow-lg"
                          : "border-gray-200 bg-white hover:border-red-300"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-red-600" />
                      </div>

                      <h4 className="font-bold text-xl text-gray-900">
                        {service.title}
                      </h4>

                      <p className="text-gray-500 mt-2">
                        {service.description}
                      </p>

                      <div className="mt-4 font-semibold text-red-600">
                        Rs. {service.price}/hour
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            {selectedService && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-5">
                  Select Date
                </h3>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {dates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(index)}
                      className={`min-w-[100px] rounded-2xl border-2 p-4 transition ${
                        selectedDate === index
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <p className="text-xs">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>

                      <p className="text-2xl font-bold">
                        {date.getDate()}
                      </p>

                      <p className="text-xs">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Slots */}
            {selectedDate !== null && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-5">
                  Select Time Slot
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`h-14 rounded-xl border-2 font-medium transition ${
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
            )}

            {/* PS5 Consoles */}
            {selectedService?.id === "ps5" && selectedSlot && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Additional Consoles
                    </h3>

                    <p className="text-gray-500 text-sm">
                      2 consoles included free
                    </p>
                  </div>

                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                    Max +2
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setExtraConsoles(Math.max(0, extraConsoles - 1))
                    }
                    className="w-11 h-11 rounded-xl border border-gray-300 flex items-center justify-center"
                  >
                    <Minus size={18} />
                  </button>

                  <div className="text-2xl font-bold w-10 text-center">
                    {extraConsoles}
                  </div>

                  <button
                    onClick={() =>
                      setExtraConsoles(Math.min(2, extraConsoles + 1))
                    }
                    className="w-11 h-11 rounded-xl border border-gray-300 flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <p className="text-gray-500 text-sm mt-4">
                  Rs. 500 per additional console
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">
                Booking Summary
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-gray-500 text-sm">Service</p>
                  <p className="font-semibold">
                    {selectedService?.title || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Date</p>
                  <p className="font-semibold">
                    {selectedDate !== null
                      ? dates[selectedDate].toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Time Slot</p>
                  <p className="font-semibold">
                    {selectedSlot || "-"}
                  </p>
                </div>

                {selectedService?.id === "ps5" && (
                  <div>
                    <p className="text-gray-500 text-sm">
                      Additional Consoles
                    </p>
                    <p className="font-semibold">{extraConsoles}</p>
                  </div>
                )}

                <div className="border-t pt-5">
                  <div className="flex justify-between text-lg">
                    <span>Total Amount</span>

                    <span className="font-bold text-red-600">
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
                  className="w-full h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
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