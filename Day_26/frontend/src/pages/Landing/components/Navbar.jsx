import { useState } from "react";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const links = [
  ["Home", "#home"],
  ["Rooms", "#rooms"],
  ["Services", "#services"],
  ["About", "#about"],
  ["Contact", "#contact"],
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#home" className="flex items-center gap-3 text-white no-underline">
          <img src="/logo/logo.png" alt="HotelPro" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-semibold tracking-wide">HotelPro</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="text-sm font-medium text-white/90 transition hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white hover:text-[#2E2A27]">
            Login
          </Link>
          <Link to="/signup" className="rounded-full bg-[#C76A34] px-5 py-2 text-sm font-semibold text-white no-underline shadow-lg transition hover:bg-[#A74E2B]">
            Sign up
          </Link>
        </div>

        <button type="button" onClick={() => setOpen(!open)} className="text-2xl text-white lg:hidden" aria-label="Toggle menu">
          {open ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {open && (
        <div className="mx-4 rounded-2xl bg-white p-5 shadow-xl lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="text-sm font-medium text-[#2E2A27] no-underline">
                {label}
              </a>
            ))}
            <div className="flex gap-3 border-t border-[#ECE6DF] pt-4">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#C76A34] px-4 py-2 text-center text-sm font-semibold text-[#C76A34] no-underline">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-[#C76A34] px-4 py-2 text-center text-sm font-semibold text-white no-underline">Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
