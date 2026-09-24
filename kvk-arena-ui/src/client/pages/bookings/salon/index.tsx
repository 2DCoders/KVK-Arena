import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

export default function SalonBooking() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("Hair Styling");
  const [checked, setChecked] = useState(false);

  const services = [
    "Hair Styling",
    "Hair Cutting",
    "Hair Coloring",
    "Hair Wash & Treatment",
    "Premium Grooming",
  ];

  const handleAvailability = () => {
    if (!date || !time) return;

    setChecked(true);
  };

  return (
    <section className="relative overflow-hidden bg-[#160d20] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
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
            Choose your preferred service, date, and time.
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

              {/* Service */}

              <div>
                <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                  Select Service
                </label>

                <div className="flex flex-wrap gap-2">
                  {services.map((item) => {
                    const active = service === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setService(item)}
                        className={`
                          rounded-full
                          border
                          px-4
                          py-2.5
                          text-xs
                          font-medium
                          transition-all
                          duration-300

                          ${
                            active
                              ? "border-purple-300/40 bg-purple-300 text-[#160d20]"
                              : "border-white/10 bg-white/[0.04] text-white/55 hover:border-purple-300/30 hover:bg-white/[0.08] hover:text-white"
                          }
                        `}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Date & Time */}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">

                {/* Date */}

                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45"
                  >
                    Select Date
                  </label>

                  <div className="group relative">

                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-purple-200/60"
                    />

                    <input
                      id="booking-date"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setChecked(false);
                      }}
                      className="
                        h-14
                        w-full
                        appearance-none
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        pl-12
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition-all

                        focus:border-purple-300/40
                        focus:bg-white/[0.07]
                        focus:ring-4
                        focus:ring-purple-500/10

                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:opacity-50
                        [&::-webkit-calendar-picker-indicator]:invert
                      "
                    />

                  </div>
                </div>


                {/* Time */}

                <div>
                  <label
                    htmlFor="booking-time"
                    className="mb-3 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/45"
                  >
                    Select Time
                  </label>

                  <div className="group relative">

                    <Clock3
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-purple-200/60"
                    />

                    <input
                      id="booking-time"
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        setChecked(false);
                      }}
                      className="
                        h-14
                        w-full
                        appearance-none
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        pl-12
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition-all

                        focus:border-purple-300/40
                        focus:bg-white/[0.07]
                        focus:ring-4
                        focus:ring-purple-500/10

                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:opacity-50
                        [&::-webkit-calendar-picker-indicator]:invert
                      "
                    />

                  </div>
                </div>

              </div>


              {/* Selected Appointment Preview */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Selected Service
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {service}
                    </p>
                  </div>

                  {date && time && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Appointment
                      </p>

                      <p className="mt-1 text-sm font-medium text-purple-200">
                        {date} · {time}
                      </p>
                    </div>
                  )}

                </div>

              </div>


              {/* Check Availability */}

              <button
                type="button"
                onClick={handleAvailability}
                disabled={!date || !time}
                className="
                  group
                  mt-6
                  flex
                  h-14
                  w-full
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
                {checked ? "Availability Checked" : "Check Availability"}

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>


              {/* Result */}

              {checked && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 px-4 py-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300/10">
                    <Check
                      size={15}
                      className="text-emerald-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-200">
                      Time slot available
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/40">
                      You can continue with your booking.
                    </p>
                  </div>

                </div>
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