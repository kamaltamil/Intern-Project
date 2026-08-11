import { CalendarOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DatePicker, Select } from "antd";
import { useNavigate } from "react-router-dom";

function BookingSearch() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 sm:-mt-20 lg:px-8">
      <div className="rounded-3xl bg-white p-4 shadow-[0_20px_60px_rgba(46,42,39,0.14)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
          <label className="block rounded-2xl border border-[#ECE6DF] bg-[#FCFAF7] px-4 py-3">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]"><CalendarOutlined /> Check-in</span>
            <DatePicker bordered={false} className="w-full p-0" placeholder="Select date" />
          </label>
          <label className="block rounded-2xl border border-[#ECE6DF] bg-[#FCFAF7] px-4 py-3">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]"><CalendarOutlined /> Check-out</span>
            <DatePicker bordered={false} className="w-full p-0" placeholder="Select date" />
          </label>
          <label className="block rounded-2xl border border-[#ECE6DF] bg-[#FCFAF7] px-4 py-3">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B8179]"><UserOutlined /> Guests</span>
            <Select bordered={false} className="w-full p-0" defaultValue="2 Guests" options={["1 Guest", "2 Guests", "3 Guests", "4+ Guests"].map((value) => ({ value, label: value }))} />
          </label>
          <button type="button" onClick={() => navigate("/login")} className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-[#C76A34] px-7 font-semibold text-white transition hover:bg-[#A74E2B]">
            <SearchOutlined /> Search Rooms
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookingSearch;
