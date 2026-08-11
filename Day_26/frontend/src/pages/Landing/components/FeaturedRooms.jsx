import { ArrowRightOutlined, CheckOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const rooms = [
  { type: "Single", title: "Comfort Single", price: 50, image: "/landing/member-hero.jpg", text: "A calm and practical room for solo stays." },
  { type: "Double", title: "Classic Double", price: 80, image: "/landing/manager-hero.jpg", text: "A spacious room designed for two guests." },
  { type: "Suite", title: "Signature Suite", price: 120, image: "/landing/admin-hero.jpg", text: "Extra space and comfort for a special stay." },
];

function FeaturedRooms() {
  return (
    <section id="rooms" className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C76A34]">Our rooms</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Choose your perfect room.</h2>
          <p className="mt-3 max-w-xl leading-7 text-[#756C65]">Comfortable spaces for short visits, family trips, and longer stays.</p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C76A34] no-underline">View booking options <ArrowRightOutlined /></Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <article key={room.type} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#ECE6DF] transition hover:-translate-y-1 hover:shadow-xl">
            <img src={room.image} alt={room.title} className="h-60 w-full object-cover" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C76A34]">{room.type} room</span>
                  <h3 className="mt-1 text-xl font-semibold">{room.title}</h3>
                </div>
                <div className="text-right"><span className="text-xl font-bold">${room.price}</span><span className="block text-xs text-[#8B8179]">/ night</span></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#756C65]">{room.text}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#756C65]"><span><CheckOutlined className="mr-1 text-[#C76A34]" />WiFi</span><span><CheckOutlined className="mr-1 text-[#C76A34]" />Daily service</span><span><CheckOutlined className="mr-1 text-[#C76A34]" />Comfort bed</span></div>
              <Link to="/login" className="mt-6 block rounded-full border border-[#C76A34] px-5 py-3 text-center text-sm font-semibold text-[#C76A34] no-underline transition hover:bg-[#C76A34] hover:text-white">Book this room</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedRooms;
