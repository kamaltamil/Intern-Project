import { ArrowRightOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section id="home" className="relative min-h-[620px] overflow-hidden bg-[#27221F] sm:min-h-[680px]">
      <img src="/landing/admin-hero.jpg" alt="Hotel reception" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,20,17,0.78)_0%,rgba(25,20,17,0.46)_50%,rgba(25,20,17,0.18)_100%)]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-5 pb-24 pt-32 sm:min-h-[680px] lg:px-8">
        <div className="max-w-2xl text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#E4B07A]">Welcome to HotelPro</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Comfortable stays,<br />
            <span className="text-[#E4B07A]">memorable experiences.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Find the perfect room, relax in thoughtful spaces, and enjoy a seamless hotel experience from booking to checkout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-[#C76A34] px-6 py-3 text-sm font-semibold text-white no-underline shadow-xl transition hover:bg-[#A74E2B]">
              Book Now <ArrowRightOutlined />
            </Link>
            <a href="#rooms" className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white no-underline backdrop-blur-sm transition hover:bg-white hover:text-[#2E2A27]">
              <PlayCircleOutlined /> Explore Rooms
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-8 border-t border-white/20 pt-6 text-sm text-white/75">
            <span><strong className="text-white">24/7</strong> Guest Support</span>
            <span><strong className="text-white">Best</strong> Room Selection</span>
            <span><strong className="text-white">Secure</strong> Booking</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
