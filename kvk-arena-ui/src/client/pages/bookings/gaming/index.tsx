import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Monitor,
  Gamepad2,
  Trophy,
  Film,
  Minus,
  Plus,
  Joystick,
  X,
  Clock3,
  CreditCard,
  ShieldCheck,
  Info,
  AlertTriangle,
} from "lucide-react";
import { getNextWorkingDays } from "@/services/holidays-api";
import { getGamingCategories } from "@/services/gaming-category-api";
import { getGamingStationsByCategory } from "@/services/gaming-station-api";
import { getGamingSlotAvailability } from "@/services/gaming-slot-api";
import { getAdditionalPurchasesByCategory } from "@/services/additional-purchase-api";
import { holdGamingBookingSlots, confirmGamingBooking } from "@/services/gaming-booking-api";
import Alert from "@/components/alert";

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

type PaymentType = 1 | 2;

const CATEGORY_ICONS: Record<string, any> = {
  PC: Monitor,
  PS5: Gamepad2,
  POOL: Trophy,
  MOVIE: Film,
};

const getCategoryIcon = (code: string) => CATEGORY_ICONS[code?.toUpperCase()] ?? Joystick;

const MAX_ADDITIONAL_PURCHASE_QUANTITY = 4;
const HOLD_DURATION_SECONDS = 7 * 60;

const formatTime = (time: string) => {
  const [hoursText, minutesText] = time.split(":");
  const hoursNumber = Number(hoursText);
  const minutes = minutesText ?? "00";

  const period = hoursNumber >= 12 ? "PM" : "AM";
  const displayHours = hoursNumber % 12 === 0 ? 12 : hoursNumber % 12;

  return `${displayHours}.${minutes} ${period}`;
};

const formatCountdown = (totalSeconds: number) => {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (clamped % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
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

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhoneError, setCustomerPhoneError] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>(1);
  const [holdIds, setHoldIds] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(HOLD_DURATION_SECONDS);

  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [pageAlert, setPageAlert] = useState<{
    visible: boolean;
    variant?: "success" | "error" | "warning" | "info";
    title?: string;
    description?: string;
  }>({ visible: false });

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

  const refreshStationSlots = async () => {
    if (!selectedCategory || !selectedDateString || stations.length === 0) {
      setStationSlots({});
      return;
    }

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

  useEffect(() => {
    refreshStationSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const additionalAmount =
      additionalPurchases.reduce((sum, purchase) => {
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

  /* -------------------------------------------------------------------------- */
  /* Hold countdown                                                             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isBookingModalOpen || !holdExpiresAt) return;

    const updateRemaining = () => {
      const secondsLeft = Math.max(0, Math.round((holdExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      return secondsLeft;
    };

    if (updateRemaining() <= 0) {
      window.location.reload();
      return;
    }

    const interval = window.setInterval(() => {
      if (updateRemaining() <= 0) {
        window.clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isBookingModalOpen, holdExpiresAt]);

  /* -------------------------------------------------------------------------- */
  /* Hold selected slots + open checkout modal                                  */
  /* -------------------------------------------------------------------------- */

  const handleStartBooking = async () => {
    if (
      !selectedCategory ||
      selectedDate === null ||
      !selectedDateString ||
      selectedSlots.length === 0 ||
      selectedStations.length === 0
    ) {
      return;
    }

    setIsHolding(true);

    try {
      const sortedSlotIndexes = [...selectedSlots].sort((a, b) => a - b);

      const bookings = selectedStations
        .flatMap((stationId) =>
          sortedSlotIndexes.map((slotIndex) => {
            const slotTime = masterSlots[slotIndex];

            const stationSlot = (stationSlots[stationId] ?? []).find(
              (slot) => slot.startTime === slotTime?.startTime
            );

            if (!slotTime || !stationSlot) return null;

            return {
              gamingCategoryId: selectedCategory.id,
              gamingStationId: stationId,
              gamingSlotId: stationSlot.id,
              bookingDate: selectedDateString,
            };
          })
        )
        .filter((booking): booking is NonNullable<typeof booking> => booking !== null);

      if (bookings.length === 0) {
        throw new Error("Unable to resolve the selected slots. Please try again.");
      }

      const additionalPurchasesPayload = additionalPurchases
        .filter((purchase) => (purchaseQuantities[purchase.id] ?? 0) > 0)
        .map((purchase) => ({
          additionalPurchaseId: purchase.id,
          quantity: purchaseQuantities[purchase.id],
        }));

      if (additionalPurchasesPayload.length > 0) {
        bookings[0] = { ...bookings[0], additionalPurchases: additionalPurchasesPayload } as any;
      }

      const requestBody = {
        bookings,
        totalAmount: total,
        paymentTypes: 1,
      };

      const holdResponse = await holdGamingBookingSlots(requestBody);

      const holdItems =
        holdResponse?.additionalData?.response ??
        holdResponse?.response ??
        holdResponse ??
        [];

      const ids = Array.isArray(holdItems)
        ? holdItems.map((item: any) => item?.holdId ?? item?.id).filter(Boolean)
        : [];

      if (ids.length === 0) {
        throw new Error("The booking service did not return any hold IDs.");
      }

      const firstExpiresAt = Array.isArray(holdItems) ? holdItems[0]?.expiresAt : null;
      const expiresAtMs = firstExpiresAt
        ? new Date(firstExpiresAt).getTime()
        : Date.now() + HOLD_DURATION_SECONDS * 1000;

      setHoldIds(ids);
      setHoldExpiresAt(expiresAtMs);
      setRemainingSeconds(Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000)));
      setIsBookingModalOpen(true);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unable to hold the selected slots.";

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Booking failed",
        description: message,
      });
    } finally {
      setIsHolding(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Close modal                                                                 */
  /* -------------------------------------------------------------------------- */

  const requestCloseBookingModal = () => {
    setIsCloseConfirmOpen(true);
  };

  const cancelCloseBookingModal = () => {
    setIsCloseConfirmOpen(false);
  };

  const confirmCloseBookingModal = () => {
    if (remainingSeconds <= 0) {
      window.location.reload();
      return;
    }

    setIsCloseConfirmOpen(false);
    setIsBookingModalOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerPhoneError("");
    setHoldIds([]);
    setHoldExpiresAt(null);

    setPageAlert({
      visible: true,
      variant: "warning",
      title: "Slots still on hold",
      description:
        "Your selected slots are still reserved for a few more minutes. If you don't complete the booking, they will automatically become available again once the 7-minute hold expires.",
    });
  };

  /* -------------------------------------------------------------------------- */
  /* Confirm booking                                                            */
  /* -------------------------------------------------------------------------- */

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      if (!customerPhone.trim()) {
        setCustomerPhoneError(
          "Please enter a mobile number starting with 07 and containing exactly 10 digits."
        );
      }

      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Missing customer details",
        description: "Please enter the customer name and mobile number.",
      });

      return;
    }

    if (!/^07\d{8}$/.test(customerPhone)) {
      setCustomerPhoneError(
        "Please enter a valid mobile number starting with 07 and containing exactly 10 digits."
      );

      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Invalid mobile number",
        description:
          "Please enter a valid mobile number starting with 07 and containing exactly 10 digits.",
      });

      return;
    }

    setCustomerPhoneError("");

    if (remainingSeconds <= 0 || holdIds.length === 0) {
      setPageAlert({
        visible: true,
        variant: "warning",
        title: "Booking hold expired",
        description: "Please select the slots again and proceed to payment.",
      });

      return;
    }

    setIsConfirming(true);

    try {
      await confirmGamingBooking({
        holdIds,
        customerDetails: {
          customerName: customerName.trim(),
          phoneNumber: customerPhone.trim(),
          paymentType,
        },
      });

      setPageAlert({
        visible: true,
        variant: "success",
        title: "Booking confirmed",
        description: "The gaming booking was confirmed successfully.",
      });

      setSelectedSlots([]);
      setSelectedStations([]);
      setPurchaseQuantities({});
      setIsBookingModalOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setHoldIds([]);
      setHoldExpiresAt(null);

      await refreshStationSlots();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unable to confirm the booking.";

      setPageAlert({
        visible: true,
        variant: "error",
        title: "Confirmation failed",
        description: message,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const selectedStationNames = stations
    .filter((station) => selectedStations.includes(station.id))
    .map((station) => station.name);

  return (
    <section className="bg-gray-50 pt-25 pb-10">
      {/* Alert */}
      {pageAlert.visible && (
        <Alert
          variant={pageAlert.variant as any}
          title={pageAlert.title}
          description={pageAlert.description}
          onClose={() => setPageAlert((s) => ({ ...s, visible: false }))}
        />
      )}

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
                    {selectedStationNames.length > 0 ? selectedStationNames.join(", ") : "-"}
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
                    selectedStations.length === 0 ||
                    isHolding
                  }
                  onClick={handleStartBooking}
                  className="w-full cursor-pointer h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isHolding && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {isHolding ? "Holding Slots..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* CHECKOUT MODAL                                                         */}
      {/* ====================================================================== */}

      {isBookingModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999999998] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-6">
            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:max-h-[90vh] sm:rounded-[2rem]">
              {/* Header */}
              <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-red-50 px-4 py-4 sm:px-7 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-600">
                      <CreditCard size={13} />
                      Booking checkout
                    </div>

                    <h3 className="mt-1.5 text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                      Review your booking
                    </h3>
                  </div>

                  <button
                    type="button"
                    disabled={isConfirming}
                    onClick={requestCloseBookingModal}
                    aria-label="Close booking review"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 sm:w-10"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Countdown */}
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold ${
                    remainingSeconds <= 60
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <Clock3 size={15} />
                  {remainingSeconds > 0 ? (
                    <span>
                      Slots held for{" "}
                      <span className="tabular-nums">{formatCountdown(remainingSeconds)}</span>{" "}
                      minutes
                    </span>
                  ) : (
                    <span>Your hold has expired. Please select the slots again.</span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-7 sm:py-6 space-y-4">
                {/* Customer details */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Customer Details</h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-gray-700">
                        Customer Name
                      </span>

                      <input
                        type="text"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="Enter customer name"
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-gray-700">
                        Customer Mobile No
                      </span>

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="07[0-9]{8}"
                        aria-invalid={Boolean(customerPhoneError)}
                        value={customerPhone}
                        onChange={(event) => {
                          setCustomerPhone(
                            event.target.value.replace(/\D/g, "").slice(0, 10)
                          );
                          setCustomerPhoneError("");
                        }}
                        placeholder="07X XXX XXXX"
                        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:ring-4 focus:ring-red-100 ${
                          customerPhoneError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-200 focus:border-red-500"
                        }`}
                      />

                      {customerPhoneError && (
                        <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
                          {customerPhoneError}
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                {/* Payment type */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Payment Type</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType(1)}
                      className={`h-12 rounded-xl border font-semibold text-sm transition cursor-pointer ${
                        paymentType === 1
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      Cash
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType(2)}
                      className={`h-12 rounded-xl border font-semibold text-sm transition cursor-pointer ${
                        paymentType === 2
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      Card
                    </button>
                  </div>
                </div>

                {/* Order summary */}
                <div className="rounded-2xl border border-gray-100 bg-[#fafafa] p-4 sm:p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="font-semibold text-gray-900">
                        {selectedCategory?.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Stations</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {selectedStationNames.join(", ")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-semibold text-gray-900">{selectedTimeRange}</span>
                    </div>

                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-black text-red-600">Rs. {total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3.5 text-xs leading-5 text-amber-900">
                  <Info size={15} className="mt-0.5 shrink-0 text-amber-700" />
                  <span>
                    If you close this window without confirming, your selected slots stay
                    reserved until the countdown above runs out, then they become available to
                    other customers again.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isConfirming || remainingSeconds <= 0}
                  onClick={handleConfirmBooking}
                  className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isConfirming && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  <CreditCard size={17} />
                  {isConfirming ? "Confirming..." : "Confirm Booking"}
                </button>

                <div className="flex items-start gap-2 text-[10px] leading-4 text-gray-500">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
                  <span>Your booking is held securely while the confirmation is processed.</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ====================================================================== */}
      {/* CLOSE CONFIRMATION DIALOG                                              */}
      {/* ====================================================================== */}

      {isCloseConfirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999999999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">Close this booking?</h3>

                  <p className="mt-1.5 text-sm text-gray-600">
                    Your selected slots will stay reserved for{" "}
                    <span className="font-bold text-amber-700">
                      {formatCountdown(remainingSeconds)}
                    </span>{" "}
                    minutes, then they'll automatically become available to other customers
                    again.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={cancelCloseBookingModal}
                  className="h-11 flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  onClick={confirmCloseBookingModal}
                  className="h-11 flex-1 cursor-pointer rounded-xl bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  Close Anyway
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
