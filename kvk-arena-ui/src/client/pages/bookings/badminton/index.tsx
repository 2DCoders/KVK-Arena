import { useMemo, useState } from "react";
import court from "@/assets/court.png";
import { CalendarDays, Clock3, MapPin, Check } from "lucide-react";

export default function BadmintonBookings() {
  const courts = [
    {
      id: "COURT 01",
      price: 2500,
      image: court,
      features: ["AC", "LED Lighting", "Premium Flooring"],
      status: "Available",
    },
    {
      id: "COURT 02",
      price: 3000,
      image: court,
      features: ["VIP Court", "LED Lighting", "Tournament Ready"],
      status: "Available",
    },
  ];

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      return {
        day: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        date: date.getDate(),
        month: date
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
      };
    });
  }, []);

  const slots = [
    "9.00 AM - 10.00 AM",
    "10.00 AM - 11.00 AM",
    "11.00 AM - 12.00 PM",
    "12.00 PM - 1.00 PM",
    "1.00 PM - 2.00 PM",
    "2.00 PM - 3.00 PM",
    "3.00 PM - 4.00 PM",
    "4.00 PM - 5.00 PM",
    "5.00 PM - 6.00 PM",
    "6.00 PM - 7.00 PM",
  ];

  const [selectedCourt, setSelectedCourt] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(5);

  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-20">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-[#C9773A]/10 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#D98B4D]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-flex rounded-full border border-[#C9773A]/20 bg-[#C9773A]/10 px-4 py-2 text-sm font-semibold text-[#A65A2A]">
            Online Booking
          </span>

          <h2 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#C9773A] bg-clip-text text-4xl font-black text-transparent sm:text-4xl lg:text-5xl">
            Book Your Court
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Reserve your preferred badminton court in seconds and enjoy a
            premium playing experience at KVK Arena.
          </p>
        </div>

        {/* Court Selection */}
        <div className="grid gap-8 lg:grid-cols-2">
          {courts.map((courtItem, index) => (
            <button
            data-aos="fade-up"
              key={courtItem.id}
              onClick={() => setSelectedCourt(index)}
              className={`group cursor-pointer overflow-hidden rounded-[28px] border bg-white text-left transition-all duration-500
                ${
                  selectedCourt === index
                    ? "border-[#C9773A] shadow-[0_25px_60px_rgba(201,119,58,0.25)] -translate-y-2"
                    : "border-gray-200 hover:-translate-y-2 hover:border-[#C9773A]/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                }`}
            >
              <div className="relative h-72">
                <img
                  src={courtItem.image}
                  alt={courtItem.id}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Price */}
                <div className="absolute left-5 top-5 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                  <p className="text-xs font-medium text-gray-500">
                    Starting From
                  </p>
                  <p className="text-lg font-black text-[#A65A2A]">
                    LKR {courtItem.price.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="absolute right-5 top-5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                  {courtItem.status}
                </div>

                {/* Selected Badge */}
                <div
                  className={`absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full transition-all
                    ${
                      selectedCourt === index
                        ? "bg-[#C9773A] text-white"
                        : "bg-white/90 text-transparent"
                    }`}
                >
                  <Check className="h-5 w-5" />
                </div>

                {/* Court Name */}
                <div className="absolute bottom-5 left-5">
                  <h3 className="text-3xl font-black text-white">
                    {courtItem.id}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      Professional Indoor Court
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {courtItem.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-[#A65A2A]/10 px-3 py-1 text-xs font-semibold text-[#A65A2A]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Date Selection */}
        <div className="mt-16" data-aos="fade-up">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#A65A2A]" />
            <h3 className="text-xl font-bold text-gray-900">
              Select Date
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {dates.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(index)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300
                  ${
                    selectedDate === index
                      ? "border-[#A65A2A] bg-gradient-to-br from-[#A65A2A] to-[#C9773A] text-white shadow-lg"
                      : "border-gray-200 bg-white hover:-translate-y-1 hover:border-[#C9773A]/40 hover:shadow-md"
                  }`}
              >
                <p className="text-xs font-bold">{item.day}</p>
                <p className="text-3xl font-black">{item.date}</p>
                <p className="text-xs">{item.month}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mt-16" data-aos="fade-up">
          <div className="mb-5 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-[#A65A2A]" />
            <h3 className="text-xl font-bold text-gray-900">
              Select Time Slot
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot, index) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(index)}
                className={`cursor-pointer h-14 rounded-xl border font-semibold transition-all duration-300
                  ${
                    selectedSlot === index
                      ? "border-[#A65A2A] bg-gradient-to-r from-[#A65A2A] to-[#C9773A] text-white shadow-lg"
                      : "border-gray-200 bg-white hover:border-[#A65A2A]/40 hover:shadow-md"
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-[#C9773A]/15 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]" data-aos="fade-up">
          <div className="h-2 bg-gradient-to-r from-[#A65A2A] via-[#C9773A] to-[#D98B4D]" />

          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Booking Summary
                </p>

                <h3 className="mt-2 text-3xl font-black text-gray-900">
                  {courts[selectedCourt].id}
                </h3>

                <p className="mt-2 text-gray-600">
                  {slots[selectedSlot]}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Total Amount
                  </span>

                  <span className="text-3xl font-black text-[#A65A2A]">
                    LKR{" "}
                    {courts[selectedCourt].price.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                className="
                  cursor-pointer
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#A65A2A]
                  to-[#C9773A]
                  px-10
                  py-4
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:shadow-[0_15px_40px_rgba(201,119,58,0.35)]
                  active:scale-95
                "
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}