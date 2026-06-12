import logoSrc from "@/assets/kvk-arena-header-logo.png";
import {
  InstagramOutlined,
  WhatsAppOutlined,
  TikTokOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function GamingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative overflow-hidden bg-[#f5f5f5] py-16 md:py-24">
      {/* Background Text */}
      <div className="pointer-events-none absolute bottom-[-90px] left-1/2 -translate-x-1/2 select-none">
        <h1 className="text-[140px] md:text-[260px] font-black tracking-tight text-slate-200/40 whitespace-nowrap">
          KVK Arena
        </h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="rounded-[36px] border border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.06)] px-6 py-10 md:px-12 md:py-14">
          {/* Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <img
                  src={logoSrc}
                  alt="KvK Arena"
                  className="h-11 w-auto object-contain"
                />
              </div>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-500">
                KVK Arena is a modern sports and entertainment space where fitness, gaming, and recreation come together for an active and enjoyable experience.
              </p>

              {/* Socials */}
              <div className="mt-8 flex items-center gap-4">
                <a href="https://wa.me/+94765605885"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp" className="text-slate-500 transition hover:text-black">
                  <WhatsAppOutlined className="h-5 w-5" />
                </a>

                <a href="https://www.tiktok.com/@kvk.arena?_r=1&_t=ZS-96Z68QaWNRh"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok" className="text-slate-500 transition hover:text-black">
                  <TikTokOutlined className="h-5 w-5" />
                </a>

                <a href="https://www.facebook.com/share/1A6qJ3RfSy/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook" className="text-slate-500 transition hover:text-black">
                  <FacebookOutlined className="h-5 w-5" />
                </a>

                <a href="https://www.instagram.com/kvk_arena"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram" className="text-slate-500 transition hover:text-black">
                  <InstagramOutlined className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                {/* Product */}
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-900">
                    Services
                  </h4>

                  <ul className="mt-5 space-y-3">
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/gym");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Gym
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/badminton");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Badminton
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/gaming");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Gaming
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/carwash");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Carwash
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/cafe");
                        }}
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Cafe
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-900">
                    Company
                  </h4>

                  <ul className="mt-5 space-y-3">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Home
                      </a>
                    </li>

                    <li>
                      <a
                        href="#games"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Games
                      </a>
                    </li>

                    <li>
                      <a
                        href="#movies"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Movies
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-900">
                    Support
                  </h4>

                  <ul className="mt-5 space-y-3">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Privacy Policy
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Terms & Conditions
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-slate-900 transition"
                      >
                        Refund Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} KvK Arena. All rights reserved. | Developed by <a href="https://2dcoders.lk" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition bold">
                <b> 2D-Coders </b>
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}