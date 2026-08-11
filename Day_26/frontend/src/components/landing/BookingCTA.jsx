import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function BookingCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#C76A34] px-6 py-12 text-center text-white sm:px-10 sm:py-16">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-black/10" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">Plan your next stay</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Ready for your next stay?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">Book your room today and enjoy a comfortable hotel experience from arrival to checkout.</p>
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#C76A34] no-underline shadow-lg transition hover:bg-[#2E2A27] hover:text-white">Book Now <ArrowRightOutlined /></Link>
        </div>
      </div>
    </section>
  );
}

export default BookingCTA;
