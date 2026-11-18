import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingError, cancelMemberBooking, trackMemberBooking, uploadMemberSlip, type MemberSlipStatus } from "@/services/member-badminton-api";
import BankTransferInstructions from "./bank-transfer-details";
import { money } from "./booking-utils";
import "./member-booking.css";

const statuses = {
  awaiting_payment: "Awaiting payment slip",
  retry_payment: "Payment slip rejected",
  awaiting_approval: "Awaiting admin approval",
  approved: "Booking approved",
  expired: "Payment window expired",
  rejected: "Payment slip rejected",
  cancelled: "Booking cancelled",
};

export default function MemberBadmintonTracking() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(reference ?? "");
  const [booking, setBooking] = useState<MemberSlipStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBooking(null);
    setFile(null);
    setError("");
    if (!reference) { setLoading(false); return; }
    setInput(reference);
    setLoading(true);
    const controller = new AbortController();
    void trackMemberBooking(reference, controller.signal)
      .then(setBooking)
      .catch(reason => { if (!controller.signal.aborted) setError(bookingError(reason)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reference, refresh]);

  async function upload() {
    if (!booking || !file || uploading || cancelling) return;
    if (file.size > 5 * 1024 * 1024) { setError("Choose a payment slip up to 5 MB."); return; }
    setUploading(true);
    setError("");
    try {
      await uploadMemberSlip(booking.reference, file);
      setBooking({ ...booking, status: "awaiting_approval", rejectionReason: null });
      setFile(null);
    } catch (reason) {
      setError(bookingError(reason));
    } finally {
      setUploading(false);
    }
  }

  async function cancel() {
    if (!booking || uploading || cancelling) return;
    if (!window.confirm("Cancel this booking and release its reserved sessions?")) return;
    setCancelling(true);
    setError("");
    try {
      const result = await cancelMemberBooking(booking.reference);
      setBooking({ ...booking, status: "cancelled", couponLinked: result.couponLinked });
      setFile(null);
    } catch (reason) {
      setError(bookingError(reason));
    } finally {
      setCancelling(false);
    }
  }

  return <div className="member-badminton">
    <main className="mb-container mb-booking-area">
      <Link className="mb-back" to="/members/badminton">Back to member reservations</Link>
      <section className="mb-panel">
        <h1>Track your badminton booking</h1>
        <form className="mb-fields" onSubmit={event => {
          event.preventDefault();
          if (input === reference) setRefresh(current => current + 1);
          else navigate(`/members/badminton/track/${encodeURIComponent(input)}`);
        }}>
          <div className="mb-field">
            <label htmlFor="tracking-reference">Booking reference</label>
            <input id="tracking-reference" value={input} required maxLength={36}
              pattern="[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
              onChange={event => setInput(event.target.value.trim())} />
          </div>
          <button className="mb-primary" disabled={loading || uploading || cancelling}>Track booking</button>
        </form>
        {loading && <p role="status">Checking booking...</p>}
        {error && <p className="mb-alert" role="alert">{error}</p>}
        {booking && <div className="mb-fields">
          <h2>{statuses[booking.status]}</h2>
          <p>Booking amount {money(booking.finalAmount)}</p>
          {booking.rejectionReason && <p><strong>Rejection reason</strong> {booking.rejectionReason}</p>}
          {(booking.status === "awaiting_payment" || booking.status === "retry_payment") && <form className="mb-fields" onSubmit={event => { event.preventDefault(); void upload(); }}>
            <p>{booking.status === "retry_payment" ? "Upload a replacement slip by" : "Pay and upload your slip by"} {new Date(booking.paymentDueUtc).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" })} Sri Lanka time.</p>
            <BankTransferInstructions details={booking.bankTransfer} />
            <div className="mb-field">
              <label htmlFor="payment-slip">Payment slip (PDF, PNG or JPEG, up to 5 MB)</label>
              <input id="payment-slip" type="file" accept="application/pdf,image/png,image/jpeg" required
                disabled={uploading || cancelling} onChange={event => setFile(event.target.files?.[0] ?? null)} />
            </div>
            <button className="mb-primary" disabled={!file || uploading || cancelling}>{uploading ? "Uploading..." : "Upload payment slip"}</button>
          </form>}
          {booking.status === "awaiting_approval" && <p>Check this page for the admin decision.</p>}
          {booking.status === "cancelled" && <>
            {booking.couponLinked === false && <p>This older booking has no linked coupon. Contact KVK Arena with your booking reference and coupon code to restore it.</p>}
            <Link className="mb-primary" to="/members/badminton">Book again</Link>
          </>}
          {booking.status !== "approved" && booking.status !== "cancelled" &&
            <button className="mb-cancel" type="button" disabled={uploading || cancelling}
              onClick={() => void cancel()}>{cancelling ? "Cancelling..." : "Cancel booking"}</button>}
        </div>}
      </section>
    </main>
  </div>;
}
