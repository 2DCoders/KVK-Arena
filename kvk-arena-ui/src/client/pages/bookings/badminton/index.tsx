import { useEffect, useMemo, useState } from "react";
import courtImg from "@/assets/court.png";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Star,
  Users,
  Trophy,
} from "lucide-react";
import { getCourts } from "@/services/court-api";
import { getNextWorkingDays } from "@/services/holidays-api";

export default function BadmintonBookings() {
  const [courts, setCourts] = useState<
    {
      id: string;
      name: string;
      price: number;
      status: number;
      image: string;
      features: string[];
    }[]
  >([]);
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


  useEffect(() => {
    handleGetCourts();
  }, []);

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

  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const toggleCourt = (index: number) => {
    const court = courts[index];

    if (court.status === 2) return;

    setSelectedCourts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleSlot = (index: number) => {
    if (selectedSlots.length === 0) {
      setSelectedSlots([index]);
      return;
    }

    if (selectedSlots.includes(index)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== index));
      return;
    }

    const sorted = [...selectedSlots].sort((a, b) => a - b);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const isAdjacent = index === min - 1 || index === max + 1;

    if (isAdjacent) {
      setSelectedSlots([...selectedSlots, index]);
    }
  };

  const serviceFee = 100;
  const selectedCourtObjects = selectedCourts.map((index) => courts[index]);

  const courtFee = selectedCourtObjects.reduce(
    (sum, court) => sum + court.price,
    0,
  );

  const subtotal = courtFee * selectedSlots.length;
  const total = subtotal + serviceFee;

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

          <h1 className="mt-5 bg-gradient-to-r from-black via-[#A65A2A] to-[#D48A52] bg-clip-text text-5xl font-black text-transparent md:text-5xl">
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

        {/* DATE */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-10">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="text-amber-600" />
            <h3 className="font-black text-lg">Select Date</h3>
          </div>

          <div className="grid grid-cols-7 gap-4 p-2">
            {workingDays.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(index)}
                className={`
        rounded-2xl
        border
        p-4
        transition-all
        duration-300
        cursor-pointer
        ${selectedDate === index
                    ? "scale-105 border-amber-500 bg-[#A65A2A] text-white shadow-xl"
                    : "border-gray-200 bg-white hover:border-amber-300"
                  }
      `}
              >
                {item.isToday && (
                  <div className="mb-2 text-[10px] font-bold">
                    TODAY
                  </div>
                )}

                <p className="text-xs font-bold">{item.day}</p>

                <p className="text-3xl font-black">{item.date}</p>

                <p className="text-xs">{item.month}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
          {/* LEFT SIDE */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            {courts.map((courtItem, index) => (
              <button
                disabled={courtItem.status === 2}
                key={courtItem.id}
                onClick={() => toggleCourt(index)}
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
                  ${selectedCourts.includes(index)
                    ? "border-amber-500 shadow-2xl ring-4 ring-amber-200 scale-[1.02]"
                    : "border-gray-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                  }
                  ${courtItem.status === 2
                    ? "cursor-not-allowed opacity-60 grayscale"
                    : selectedCourts.includes(index)
                      ? "border-amber-500 shadow-2xl ring-4 ring-amber-200 scale-[1.02]"
                      : "border-gray-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                  }
                `}
              >
                <div className="relative h-52 overflow-hidden">
                  <div className="absolute top-4 left-4 z-20">
                    <input
                      type="checkbox"
                      checked={selectedCourts.includes(index)}
                      onChange={() => toggleCourt(index)}
                      disabled={courtItem.status === 2}
                      className="h-5 w-5 cursor-pointer accent-amber-600"
                    />
                  </div>
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
                    {courtItem.status === 2
                      ? "Temporarily Closed"
                      : "Available"}
                  </span>

                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-black">{courtItem.name}</h4>

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
                    onClick={() => toggleSlot(index)}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                      cursor-pointer
                      duration-300
                      ${!slot.available || isPastSlot(slot.time, selectedDate)
                        ? "cursor-not-allowed border-red-200 bg-red-50 opacity-60"
                        : selectedSlots.includes(index)
                          ? "border-amber-500 bg-[#A65A2A] text-white shadow-lg"
                          : "border-gray-200 hover:border-amber-300 hover:shadow-md"
                      }
                    `}
                  >
                    <p className="font-semibold text-sm">{slot.time}</p>

                    <p
                      className={`mt-2 text-xs font-bold ${slot.available
                          ? selectedSlots.includes(index)
                            ? "text-white"
                            : "text-green-600"
                          : "text-red-500"
                        }`}
                    >
                      {isPastSlot(slot.time, selectedDate)
                        ? "Expired"
                        : slot.available
                          ? "Available"
                          : "Booked"}
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
                  <span className="text-gray-500">Courts</span>

                  <span className="font-semibold text-right">
                    {selectedCourtObjects.length
                      ? selectedCourtObjects.map((c) => c.name).join(", ")
                      : "Select Courts"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {dates[selectedDate].date} {dates[selectedDate].month}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Slots</span>

                  <span className="font-semibold text-right">
                    {selectedSlots.length
                      ? selectedSlots
                        .sort((a, b) => a - b)
                        .map((i) => slots[i].time)
                        .join(", ")
                      : "Select Slots"}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span>Court Fee</span>
                    <span>LKR {courtFee}</span>
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
                  from-[#A65A2A]
                  via-[#D4A76A]
                  to-[#A65A2A]
                  px-8
                  py-4
                  font-bold
                  text-white
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  hover:shadow-[0_15px_40px_rgba(201,119,58,0.35)]
                  cursor-pointer
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
