import { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardList, CloudUpload, LoaderCircle, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingError, cancelMemberBooking, trackMemberBooking, uploadMemberSlip, type MemberSlipStatus } from "@/services/member-badminton-api";
import MemberHeader from "./member-header";
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
  const slipInput = useRef<HTMLInputElement>(null);
  const [uploadNotice, setUploadNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const replacing = booking?.status === "awaiting_approval" && booking.finalAmount > 0;

  useEffect(() => {
    setBooking(null);
    setUploadNotice("");
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
    setUploadNotice("");
    setError("");
    try {
      await uploadMemberSlip(booking.reference, file);
      setBooking({ ...booking, status: "awaiting_approval", rejectionReason: null });
      setFile(null);
      if (slipInput.current) slipInput.current.value = "";
      setUploadNotice(replacing ? "Replacement slip uploaded." : "Payment slip uploaded.");
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
    setUploadNotice("");
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
    <MemberHeader tracking />
    <main className={`mb-container mb-tracking-area${booking ? " has-booking" : ""}`}>
      <section className="mb-panel mb-track-search" aria-labelledby="mb-track-search-title">
        <div className="mb-panel-heading">
          <span className="mb-section-icon"><Search size={20} /></span>
          <div><h2 id="mb-track-search-title">Find your reservation</h2><p>Enter the booking reference from your SMS or receipt.</p></div>
        </div>
        <form className="mb-fields" onSubmit={event => {
          event.preventDefault();
          if (input === reference) setRefresh(current => current + 1);
          else navigate(`/members/badminton/track/${encodeURIComponent(input)}`);
        }}>
          <div className="mb-field">
            <label htmlFor="tracking-reference">Booking reference</label>
            <input id="tracking-reference" value={input} required maxLength={36} spellCheck={false} autoComplete="off"
              pattern="[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
              onChange={event => setInput(event.target.value.trim())} />
          </div>
          <button className="mb-primary" disabled={loading || uploading || cancelling}>Track booking <ArrowRight size={16} /></button>
        </form>
        {loading && <p className="mb-loading" role="status"><LoaderCircle size={16} className="mb-spin" /> Checking booking...</p>}
        {!booking && error && <p className="mb-alert" role="alert">{error}</p>}
      </section>
      {booking && <section className="mb-panel mb-track-result" aria-labelledby="mb-track-result-title">
        <div className="mb-panel-heading">
          <span className="mb-section-icon"><ClipboardList size={20} /></span>
          <div><h2 id="mb-track-result-title">Booking status</h2><p className="mb-track-reference">{booking.reference}</p></div>
        </div>
        {error && <p className="mb-alert" role="alert">{error}</p>}
        <div className="mb-fields">
          <div className="mb-track-overview">
            <span className={`mb-status mb-status--${booking.status}`} role="status">{statuses[booking.status]}</span>
            <div><span>Booking amount</span><strong>{money(booking.finalAmount)}</strong></div>
          </div>
          {booking.rejectionReason && <p className="mb-alert"><strong>Rejection reason</strong> {booking.rejectionReason}</p>}
          {uploadNotice && <p className="mb-available" role="status">{uploadNotice}</p>}
          {(booking.status === "awaiting_payment" || booking.status === "retry_payment" || replacing) && <form className="mb-fields" onSubmit={event => { event.preventDefault(); void upload(); }}>
            {replacing ? <p>You can replace your uploaded slip until the booking is approved.</p> : <>
              <p className="mb-payment-deadline">{booking.status === "retry_payment" ? "Upload a replacement slip by" : "Pay and upload your slip by"} {new Date(booking.paymentDueUtc).toLocaleString("en-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" })} Sri Lanka time.</p>
              <BankTransferInstructions details={booking.bankTransfer} />
            </>}
            <div className="mb-field">
              <label htmlFor="payment-slip">{replacing ? "Replacement slip" : "Payment slip"} (PDF, PNG or JPEG, up to 5 MB)</label>
              <input id="payment-slip" ref={slipInput} type="file" accept="application/pdf,image/png,image/jpeg" required
                disabled={uploading || cancelling} onChange={event => setFile(event.target.files?.[0] ?? null)} />
            </div>
            <button className="mb-primary" disabled={!file || uploading || cancelling}><CloudUpload size={17} />{uploading ? "Uploading..." : replacing ? "Replace payment slip" : "Upload payment slip"}</button>
          </form>}
          {booking.status === "awaiting_approval" && !replacing && <p>Check this page for the admin decision.</p>}
          {booking.status === "cancelled" && <>
            {booking.couponLinked === false && <p>This older booking has no linked coupon. Contact KVK Arena with your booking reference and coupon code to restore it.</p>}
            <Link className="mb-primary" to="/members/badminton">Book again</Link>
          </>}
          {booking.status !== "approved" && booking.status !== "cancelled" &&
            <button className="mb-cancel" type="button" disabled={uploading || cancelling}
              onClick={() => void cancel()}>{cancelling ? "Cancelling..." : "Cancel booking"}</button>}
        </div>
      </section>}
    </main>
  </div>;
}
