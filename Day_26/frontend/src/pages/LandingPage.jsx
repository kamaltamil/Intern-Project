import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import BookingSearch from "../components/landing/BookingSearch";
import AboutSection from "../components/landing/AboutSection";
import ServicesSection from "../components/landing/ServicesSection";
import FeaturedRooms from "../components/landing/FeaturedRooms";
import ExperienceSection from "../components/landing/ExperienceSection";
import BookingCTA from "../components/landing/BookingCTA";
import Footer from "../components/landing/Footer";

function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F4EE] text-[#2E2A27]">
      <Navbar />

      <main>
        <HeroSection />

        <BookingSearch />

        <AboutSection />

        <ServicesSection />

        <FeaturedRooms />

        <ExperienceSection />

        <BookingCTA />
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;