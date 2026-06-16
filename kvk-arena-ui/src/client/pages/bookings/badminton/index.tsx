import { useMemo, useState } from "react";
import court from "@/assets/court.png";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Star,
  Users,
  Trophy,
} from "lucide-react";

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

  const isPastSlot = (slotTime: string, selectedDateIndex: number) => {
    // Future dates should never be disabled
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
        isToday: index === 0,
      };
    });
  }, []);

  const slots = [
    { time: "09:00 AM - 10:00 AM", available: true },
    { time: "10:00 AM - 11:00 AM", available: true },
    { time: "11:00 AM - 12:00 PM", available: false },
    { time: "12:00 PM - 01:00 PM", available: true },
    { time: "01:00 PM - 02:00 PM", available: true },
    { time: "02:00 PM - 03:00 PM", available: true },
    { time: "03:00 PM - 04:00 PM", available: false },
    { time: "04:00 PM - 05:00 PM", available: true },
    { time: "05:00 PM - 06:00 PM", available: true },
    { time: "06:00 PM - 07:00 PM", available: true },
  ];

  const [selectedCourt, setSelectedCourt] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(0);

  const serviceFee = 100;
  const total = courts[selectedCourt].price + serviceFee;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] via-white to-[#fafafa] py-20">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            🏸 Online Court Booking
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#D48A52] bg-clip-text text-5xl font-black text-transparent md:text-6xl">
            Book Your Court
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Reserve your preferred badminton court in seconds and enjoy a
            premium playing experience at KVK Arena.
          </p>

          {/* Stats */}
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

        <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
          {/* LEFT SIDE */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <h3 className="text-2xl font-black">Select Court</h3>

            {courts.map((courtItem, index) => (
              <button
                key={courtItem.id}
                onClick={() => setSelectedCourt(index)}
                className={`
                  group
                  relative
                  w-full
                  overflow-hidden
                  rounded-3xl
                  border
                  bg-white
                  text-left
                  transition-all
                  duration-500
                  cursor-pointer
                  ${
                    selectedCourt === index
                      ? "border-amber-500 shadow-2xl ring-4 ring-amber-100 scale-[1.02]"
                      : "border-gray-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                  }
                `}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={courtItem.image}
                    alt={courtItem.id}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <span className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                    Available
                  </span>

                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-black">{courtItem.id}</h4>

                    <p className="text-lg font-bold">
                      LKR {courtItem.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-5">
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
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* DATE */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays className="text-amber-600" />
                <h3 className="font-black text-lg">Select Date</h3>
              </div>

              <div className="flex gap-3 overflow-x-auto p-2">
                {dates.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(index)}
                    className={`
                      min-w-[100px]
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      duration-300
                      cursor-pointer
                      ${
                        selectedDate === index
                          ? "scale-105 border-amber-500 bg-gradient-to-br from-amber-600 to-orange-500 text-white shadow-xl"
                          : "border-gray-200 bg-white hover:border-amber-300"
                      }
                    `}
                  >
                    {item.isToday && (
                      <div className="mb-2 text-[10px] font-bold">TODAY</div>
                    )}

                    <p className="text-xs font-bold">{item.day}</p>

                    <p className="text-3xl font-black">{item.date}</p>

                    <p className="text-xs">{item.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SLOTS */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Clock3 className="text-amber-600" />
                <h3 className="font-black text-lg">Select Time Slot</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {slots.map((slot, index) => (
                  <button
                    key={slot.time}
                    disabled={
                      !slot.available || isPastSlot(slot.time, selectedDate)
                    }
                    onClick={() => setSelectedSlot(index)}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                      cursor-pointer
                      duration-300
                      ${
                        !slot.available || isPastSlot(slot.time, selectedDate)
                          ? "cursor-not-allowed border-red-200 bg-red-50 opacity-60"
                          : selectedSlot === index
                            ? "border-amber-500 bg-amber-500 text-white shadow-lg"
                            : "border-gray-200 hover:border-amber-300 hover:shadow-md"
                      }
                    `}
                  >
                    <p className="font-semibold text-sm">{slot.time}</p>

                    <p
                      className={`mt-2 text-xs font-bold ${
                        slot.available
                          ? selectedSlot === index
                            ? "text-white"
                            : "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {isPastSlot(slot.time, selectedDate) ? "Expired" :
                      slot.available ? "Available" : "Booked"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* SUMMARY */}
            <div
              className="
                sticky
                bottom-4
                z-20
                rounded-3xl
                border
                border-amber-100
                bg-white/95
                p-6
                shadow-[0_25px_60px_rgba(0,0,0,0.12)]
                backdrop-blur-xl
              "
            >
              <div className="mb-5 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                <h3 className="font-black text-lg">Booking Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Court</span>
                  <span className="font-semibold">
                    {courts[selectedCourt].id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {dates[selectedDate].date} {dates[selectedDate].month}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold">
                    {slots[selectedSlot].time}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span>Court Fee</span>
                    <span>
                      LKR {courts[selectedCourt].price.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>LKR {serviceFee}</span>
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
                className="
                  group
                  relative
                  mt-6
                  w-full
                  overflow-hidden
                  rounded-2xl
                  bg-gradient-to-r
                  from-amber-600
                  via-orange-600
                  to-amber-500
                  px-8
                  py-4
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  hover:shadow-[0_15px_40px_rgba(201,119,58,0.35)]
                "
              >
                <span className="relative z-10">Proceed To Payment</span>

                <div
                  className="
                    absolute
                    inset-0
                    translate-x-[-100%]
                    bg-gradient-to-r
                    from-transparent
                    via-white/30
                    to-transparent
                    transition-transform
                    duration-1000
                    group-hover:translate-x-[100%]
                  "
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
