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
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-[#C9773A]/20 bg-[#C9773A]/10 px-4 py-2 text-sm font-semibold text-[#A65A2A]">
            Online Booking
          </span>

          <h2 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#C9773A] bg-clip-text text-5xl font-black text-transparent">
            Book Your Court
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Reserve your preferred badminton court in seconds and enjoy a
            premium playing experience at KVK Arena.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[460px_1fr]">
          {/* LEFT SIDE */}
          <div className="lg:sticky lg:top-24 lg:h-fit" data-aos="fade-up">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-xl font-black">Select Court</h3>

              <div className="space-y-4">
                {courts.map((courtItem, index) => (
                  <button
                    key={courtItem.id}
                    onClick={() => setSelectedCourt(index)}
                    className={`w-full overflow-hidden cursor-pointer rounded-2xl border transition-all duration-300
                            ${
                            selectedCourt === index
                                ? "border-[#C9773A] shadow-lg"
                                : "border-gray-200 hover:border-[#C9773A]/40"
                            }`}
                    >
                    <div className="flex gap-4 p-4">
                      <img
                        src={courtItem.image}
                        alt=""
                        className="h-24 w-28 rounded-xl object-cover"
                      />

                      <div className="flex-1 text-left">
                        <h4 className="font-black text-gray-900">
                          {courtItem.id}
                        </h4>

                        <p className="mt-1 text-lg font-bold text-[#A65A2A]">
                          LKR {courtItem.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6" data-aos="fade-up">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#A65A2A]" />
                <h3 className="font-black text-gray-900">Select Date</h3>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(index)}
                    className={`min-w-[90px] rounded-2xl cursor-pointer border p-4 transition-all
                            ${
                            selectedDate === index
                                ? "border-[#A65A2A] bg-gradient-to-br from-[#A65A2A] to-[#C9773A] text-white"
                                : "border-gray-200 bg-white"
                            }`}
                    >
                    <p className="text-xs font-bold">{item.day}</p>

                    <p className="text-3xl font-black">{item.date}</p>

                    <p className="text-xs">{item.month}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#A65A2A]" />
                <h3 className="font-black text-gray-900">Select Time Slot</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {slots.map((slot, index) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(index)}
                    className={`h-14 cursor-pointer rounded-xl border text-sm font-semibold transition-all
                        ${
                        selectedSlot === index
                            ? "border-[#A65A2A] bg-[#A65A2A] text-white"
                            : "border-gray-200 hover:border-[#A65A2A]/40"
                        }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="
                        sticky
                        bottom-4
                        z-20
                        rounded-3xl
                        border
                        border-[#C9773A]/15
                        bg-white/95
                        p-5
                        shadow-[0_15px_40px_rgba(0,0,0,0.08)]
                        backdrop-blur-xl
                    "
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Court</p>

                    <p className="font-bold text-gray-900">
                      {courts[selectedCourt].id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Date</p>

                    <p className="font-bold text-gray-900">
                      {dates[selectedDate].date} {dates[selectedDate].month}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Time</p>

                    <p className="font-bold text-gray-900">
                      {slots[selectedSlot]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Amount</p>

                    <p className="text-2xl font-black text-[#A65A2A]">
                      LKR {courts[selectedCourt].price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  className="
                        cursor-pointer
                        rounded-2xl
                        bg-gradient-to-r
                        from-[#A65A2A]
                        to-[#C9773A]
                        px-8
                        py-3
                        font-bold
                        text-white
                        transition-all
                        duration-300
                        hover:scale-105
                        hover:shadow-[0_10px_30px_rgba(201,119,58,0.35)]
                    "
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
