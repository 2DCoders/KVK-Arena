import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/badminton_logo.png";

export default function MemberHeader({ tracking = false }: { tracking?: boolean }) {
  return <>
    <header className="mb-header">
      <div className="mb-container mb-header-inner">
        <div className="mb-header-brand">
          <img src={logo} alt="" />
          <span><strong>KVK Arena</strong><small>Badminton Club</small></span>
        </div>
        {tracking && (
          <Link className="mb-back" to="/members/badminton">
            <ArrowLeft size={16} />Back to reservations
          </Link>
        )}
      </div>
    </header>
    <div className="mb-hero">
      <div className="mb-container mb-hero-inner">
        <div className="mb-hero-copy">
          <h1>{tracking ? "Track your booking" : <>Member court <em>reservations</em></>}</h1>
          <p>{tracking ? "Check your booking status and manage your payment slip." : "Choose your sessions and reserve a court at KVK Arena."}</p>
        </div>
        {!tracking && <Link to="/members/badminton/track" className="mb-hero-link">
          <Search size={16} /> Track an existing booking <ArrowUpRight size={15} />
        </Link>}
      </div>
    </div>
  </>;
}
