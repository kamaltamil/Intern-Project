import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import BookingSearch from "./components/BookingSearch";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import FeaturedRooms from "./components/FeaturedRooms";
import ExperienceSection from "./components/ExperienceSection";
import BookingCTA from "./components/BookingCTA";
import Footer from "./components/Footer";

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
