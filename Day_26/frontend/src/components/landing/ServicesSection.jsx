import { CarOutlined, CoffeeOutlined, CustomerServiceOutlined, HomeOutlined, SafetyCertificateOutlined, WifiOutlined } from "@ant-design/icons";

const services = [
  [CustomerServiceOutlined, "24/7 Reception", "Friendly support whenever you need it."],
  [HomeOutlined, "Room Service", "Enjoy comfort without leaving your room."],
  [WifiOutlined, "Free WiFi", "Stay connected throughout your visit."],
  [CoffeeOutlined, "Breakfast", "Start your morning with a fresh meal."],
  [SafetyCertificateOutlined, "Housekeeping", "Clean, comfortable spaces every day."],
  [CarOutlined, "Parking", "Convenient parking for a stress-free stay."],
];

function ServicesSection() {
  return (
    <section id="services" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C76A34]">Our services</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything you need for a relaxing stay.</h2>
          <p className="mt-4 leading-7 text-[#756C65]">Thoughtful facilities and simple service make every HotelPro visit more comfortable.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([Icon, title, text]) => (
            <div key={title} className="rounded-3xl border border-[#ECE6DF] bg-[#FCFAF7] p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2E2D5] text-xl text-[#C76A34]"><Icon /></div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#756C65]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
