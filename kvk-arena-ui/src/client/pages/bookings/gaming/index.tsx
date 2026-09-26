import { useEffect, useMemo, useState } from "react";
import { Monitor, Gamepad2, Trophy, Film, Minus, Plus, Joystick } from "lucide-react";
import { getNextWorkingDays } from "@/services/holidays-api";
import { getGamingCategories } from "@/services/gaming-category-api";
import { getGamingStationsByCategory } from "@/services/gaming-station-api";
import { getGamingSlotAvailability } from "@/services/gaming-slot-api";
import { getAdditionalPurchasesByCategory } from "@/services/additional-purchase-api";

type GamingCategory = {
  id: string;
  name: string;
  code: string;
  price: number;
  isActive: boolean;
};

type GamingStation = {
  id: string;
  gamingCategoryId: string;
  stationCode: string;
  name: string;
  price: number;
  isActive: boolean;
};

type AdditionalPurchase = {
  id: string;
  gamingCategoryId: string;
  name: string;
  price: number;
  description?: string | null;
};

type StationSlot = {
  id: string;
  stationId: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isBooked: boolean;
  price: number;
};

type MasterSlot = {
  startTime: string;
  endTime: string;
};

type BookingDay = {
  fullDate: string;
  day: string;
  date: number;
  month: string;
  isToday: boolean;
};

const CATEGORY_ICONS: Record<string, any> = {
  PC: Monitor,
  PS5: Gamepad2,
  POOL: Trophy,
  MOVIE: Film,
};

const getCategoryIcon = (code: string) => CATEGORY_ICONS[code?.toUpperCase()] ?? Joystick;

const MAX_ADDITIONAL_PURCHASE_QUANTITY = 4;

const formatTime = (time: string) => {
  const [hoursText, minutesText] = time.split(":");
  const hoursNumber = Number(hoursText);
  const minutes = minutesText ?? "00";

  const period = hoursNumber >= 12 ? "PM" : "AM";
  const displayHours = hoursNumber % 12 === 0 ? 12 : hoursNumber % 12;

  return `${displayHours}.${minutes} ${period}`;
};

export default function BookingGaming() {
  const [categories, setCategories] = useState<GamingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GamingCategory | null>(null);

  const [stations, setStations] = useState<GamingStation[]>([]);
  const [additionalPurchases, setAdditionalPurchases] = useState<AdditionalPurchase[]>([]);
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});

  const [stationSlots, setStationSlots] = useState<Record<string, StationSlot[]>>({});

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<BookingDay[]>([]);

  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = yesterday.toISOString().split("T")[0];

  /* -------------------------------------------------------------------------- */
  /* Working days                                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchWorkingDays = async () => {
      try {
        const res = await getNextWorkingDays(startDate, 7);

        const formattedDates = res.map((dateStr: string) => {
          const date = new Date(dateStr);
          const today = new Date();

          return {
            fullDate: dateStr,
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
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

  /* -------------------------------------------------------------------------- */
  /* Gaming categories                                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getGamingCategories(true);

        const mappedCategories = (Array.isArray(response) ? response : []).map(
          (category: any) => ({
            id: category.id,
            name: category.name,
            code: category.code,
            price: category.price,
            isActive: category.isActive,
          })
        );

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching gaming categories:", error);
      }
    };

    fetchCategories();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Stations + additional purchases for the selected category                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedCategory) {
      setStations([]);
      setAdditionalPurchases([]);
      setPurchaseQuantities({});
      setStationSlots({});
      return;
    }

    const fetchCategoryData = async () => {
      setLoadingStations(true);

      try {
        const [stationsResponse, purchasesResponse] = await Promise.all([
          getGamingStationsByCategory(selectedCategory.id),
          getAdditionalPurchasesByCategory(selectedCategory.id),
        ]);

        const mappedStations = (Array.isArray(stationsResponse) ? stationsResponse : []).map(
          (station: any) => ({
            id: station.id,
            gamingCategoryId: station.gamingCategoryId,
            stationCode: station.stationCode,
            name: station.name,
            price: station.price,
            isActive: station.isActive,
          })
        );

        const mappedPurchases = (Array.isArray(purchasesResponse) ? purchasesResponse : []).map(
          (purchase: any) => ({
            id: purchase.id,
            gamingCategoryId: purchase.gamingCategoryId,
            name: purchase.name,
            price: purchase.price,
            description: purchase.description,
          })
        );

        setStations(mappedStations);
        setAdditionalPurchases(mappedPurchases);
        setPurchaseQuantities({});
      } catch (error) {
        console.error("Error fetching gaming stations/additional purchases:", error);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchCategoryData();
  }, [selectedCategory]);

  /* -------------------------------------------------------------------------- */
  /* Slot availability per station for the selected date                       */
  /* -------------------------------------------------------------------------- */

  const selectedDateString =
    selectedDate !== null ? workingDays[selectedDate]?.fullDate.split("T")[0] : null;

  useEffect(() => {
    if (!selectedCategory || !selectedDateString || stations.length === 0) {
      setStationSlots({});
      return;
    }

    const fetchStationSlots = async () => {
      setLoadingSlots(true);

      try {
        const results = await Promise.all(
          stations.map(async (station) => {
            const slots = await getGamingSlotAvailability(
              station.id,
              selectedCategory.id,
              selectedDateString
            );

            const formattedSlots: StationSlot[] = (Array.isArray(slots) ? slots : []).map(
              (slot: any) => ({
                id: slot.id,
                stationId: slot.stationId,
                categoryId: slot.categoryId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.isActive,
                isBooked: slot.isBooked,
                price: slot.price,
              })
            );

            return [station.id, formattedSlots] as const;
          })
        );

        setStationSlots(Object.fromEntries(results));
      } catch (error) {
        console.error("Error fetching gaming slot availability:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchStationSlots();
  }, [selectedCategory, selectedDateString, stations]);

  /* -------------------------------------------------------------------------- */
  /* Master slot grid (union of station slot times)                            */
  /* -------------------------------------------------------------------------- */

  const masterSlots = useMemo<MasterSlot[]>(() => {
    const map = new Map<string, MasterSlot>();

    Object.values(stationSlots).forEach((slotList) => {
      slotList.forEach((slot) => {
        if (!map.has(slot.startTime)) {
          map.set(slot.startTime, { startTime: slot.startTime, endTime: slot.endTime });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [stationSlots]);

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

    if (selectedSlots.includes(index)) {
      setSelectedSlots(selectedSlots.filter((i) => i !== index));
      return;
    }

    if (index === min - 1 || index === max + 1) {
      setSelectedSlots([...selectedSlots, index]);
    }
  };

  const duration = selectedSlots.length;

  const selectedTimeRange = useMemo(() => {
    if (selectedSlots.length === 0) return "-";

    const sorted = [...selectedSlots].sort((a, b) => a - b);

    const firstSlot = masterSlots[sorted[0]];
    const lastSlot = masterSlots[sorted[sorted.length - 1]];

    if (!firstSlot || !lastSlot) return "-";

    return `${formatTime(firstSlot.startTime)} - ${formatTime(lastSlot.endTime)}`;
  }, [selectedSlots, masterSlots]);

  const isSlotDisabled = (startTime: string, dateIndex: number | null) => {
    if (dateIndex === null || !workingDays[dateIndex]?.isToday) return false;

    const nowInSriLanka = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );

    const currentHour = nowInSriLanka.getHours();
    const currentMinute = nowInSriLanka.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const [hoursText, minutesText] = startTime.split(":");
    const slotStart = Number(hoursText) + Number(minutesText ?? "0") / 60;

    return slotStart <= currentTime;
  };

  const getSlotAvailability = (slotIndex: number) => {
    const slotTime = masterSlots[slotIndex];

    if (!selectedCategory || !selectedDateString || !slotTime) {
      return { availableStations: [] as GamingStation[], full: false };
    }

    const availableStations = stations.filter((station) => {
      const slot = (stationSlots[station.id] ?? []).find(
        (item) => item.startTime === slotTime.startTime
      );

      return slot ? slot.isActive && !slot.isBooked : false;
    });

    return { availableStations, full: availableStations.length === 0 };
  };

  const total = useMemo(() => {
    if (!selectedCategory || selectedSlots.length === 0) return 0;

    const selectedStationsPrice = stations
      .filter((station) => selectedStations.includes(station.id))
      .reduce((sum, station) => sum + (station.price || selectedCategory.price), 0);

    const baseAmount =
      (selectedStationsPrice || selectedCategory.price) * selectedSlots.length;

    const additionalAmount = additionalPurchases.reduce((sum, purchase) => {
      const quantity = purchaseQuantities[purchase.id] ?? 0;
      return sum + quantity * purchase.price;
    }, 0) * selectedSlots.length;

    return baseAmount + additionalAmount;
  }, [
    selectedCategory,
    selectedSlots,
    selectedStations,
    stations,
    additionalPurchases,
    purchaseQuantities,
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
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Service</h3>

              {categories.length === 0 ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.code);

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedDate(null);
                          setSelectedSlots([]);
                          setSelectedStations([]);
                        }}
                        className={`text-left cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                          selectedCategory?.id === category.id
                            ? "border-red-500 bg-red-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-red-300"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-red-600" />
                        </div>

                        <h4 className="font-bold text-sm text-gray-900">{category.name}</h4>

                        <div className="mt-2 font-semibold text-red-600 text-sm">
                          Rs. {category.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dates */}
            <div
              className={`transition-all ${!selectedCategory ? "opacity-40 pointer-events-none" : ""}`}
            >
              <h3 className="text-lg font-semibold mb-3">Select Date</h3>

              {workingDays.length === 0 ? (
                <div className="text-sm text-gray-500">Loading available dates...</div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {workingDays.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(index);
                        setSelectedSlots([]);
                        setSelectedStations([]);
                      }}
                      className={`h-20 cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center transition ${
                        selectedDate === index
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-200 bg-white hover:border-red-300"
                      }`}
                    >
                      {date.isToday && (
                        <div className="text-[9px] font-bold mb-1">TODAY</div>
                      )}

                      <p className="text-[10px] font-semibold">{date.day}</p>
                      <p className="text-lg font-bold">{date.date}</p>
                      <p className="text-[10px]">{date.month}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Slots */}
            <div
              className={`transition-all ${selectedDate === null ? "opacity-40 pointer-events-none" : ""}`}
            >
              <h3 className="text-lg font-semibold mb-3">Select Time Slot</h3>

              {loadingStations || loadingSlots ? (
                <div className="text-sm text-gray-500">Loading available slots...</div>
              ) : masterSlots.length === 0 ? (
                <div className="text-sm text-gray-500">
                  {selectedDate === null
                    ? "Select a date to see time slots."
                    : "No time slots configured for this service."}
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {masterSlots.map((slot, index) => {
                    const availability = getSlotAvailability(index);

                    const disabled =
                      isSlotDisabled(slot.startTime, selectedDate) || availability.full;

                    const selected = selectedSlots.includes(index);

                    return (
                      <button
                        key={slot.startTime}
                        disabled={disabled}
                        onClick={() => {
                          toggleSlot(index);
                          setSelectedStations([]);
                        }}
                        className={`h-16 cursor-pointer rounded-lg border text-xs font-medium transition
                        ${
                          selected
                            ? "bg-red-500 border-red-500 text-white"
                            : availability.full
                              ? "bg-gray-200 border-gray-300 text-gray-500"
                              : "bg-white border-gray-200 hover:border-red-300"
                        }
                        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                      >
                        <div className="leading-tight">
                          <div>{formatTime(slot.startTime)}</div>
                          <div>{formatTime(slot.endTime)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCategory && selectedSlots.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Station</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {stations.map((station) => {
                    const allSelectedSlotsAvailable = selectedSlots.every((slotIndex) => {
                      const availability = getSlotAvailability(slotIndex);

                      return availability.availableStations.some((s) => s.id === station.id);
                    });

                    const selected = selectedStations.includes(station.id);

                    return (
                      <button
                        key={station.id}
                        disabled={!allSelectedSlotsAvailable}
                        onClick={() => {
                          if (selected) {
                            setSelectedStations(
                              selectedStations.filter((id) => id !== station.id)
                            );
                          } else {
                            setSelectedStations([...selectedStations, station.id]);
                          }
                        }}
                        className={`h-12 cursor-pointer rounded-xl border font-medium transition
                        ${
                          selected
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white border-gray-200"
                        }
                        ${!allSelectedSlotsAvailable ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                      >
                        {station.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional purchases */}
            {selectedCategory && additionalPurchases.length > 0 && (
              <div
                className={`space-y-3 transition-all ${
                  selectedSlots.length === 0 ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <h3 className="text-lg font-semibold">Additional Purchases</h3>

                {additionalPurchases.map((purchase) => {
                  const quantity = purchaseQuantities[purchase.id] ?? 0;

                  return (
                    <div
                      key={purchase.id}
                      className="bg-white border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{purchase.name}</h3>

                        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
                          Rs. {purchase.price}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() =>
                            setPurchaseQuantities((prev) => ({
                              ...prev,
                              [purchase.id]: Math.max(0, quantity - 1),
                            }))
                          }
                          className="w-9 h-9 cursor-pointer rounded-lg border flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="text-xl font-bold w-8 text-center">{quantity}</span>

                        <button
                          onClick={() =>
                            setPurchaseQuantities((prev) => ({
                              ...prev,
                              [purchase.id]: Math.min(
                                MAX_ADDITIONAL_PURCHASE_QUANTITY,
                                quantity + 1
                              ),
                            }))
                          }
                          disabled={quantity >= MAX_ADDITIONAL_PURCHASE_QUANTITY}
                          className="w-9 h-9 cursor-pointer rounded-lg border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                  <p className="font-semibold">{selectedCategory?.name || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Selected Stations</p>

                  <p className="font-semibold">
                    {selectedStations.length > 0
                      ? stations
                          .filter((station) => selectedStations.includes(station.id))
                          .map((station) => station.name)
                          .join(", ")
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold">
                    {selectedDate !== null
                      ? new Date(workingDays[selectedDate]?.fullDate).toLocaleDateString()
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

                {additionalPurchases
                  .filter((purchase) => (purchaseQuantities[purchase.id] ?? 0) > 0)
                  .map((purchase) => (
                    <div key={purchase.id}>
                      <p className="text-xs text-gray-500">{purchase.name}</p>
                      <p className="font-semibold">{purchaseQuantities[purchase.id]}</p>
                    </div>
                  ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>

                    <span className="text-xl font-bold text-red-600">Rs. {total}</span>
                  </div>
                </div>

                <button
                  disabled={
                    !selectedCategory ||
                    selectedDate === null ||
                    selectedSlots.length === 0 ||
                    selectedStations.length === 0
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
