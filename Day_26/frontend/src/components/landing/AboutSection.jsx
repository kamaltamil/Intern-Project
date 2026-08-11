function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <img src="/landing/about.jpg" alt="Hotel interior" className="h-[360px] w-full rounded-[2rem] object-cover shadow-xl sm:h-[470px]" />
          <div className="absolute -bottom-6 left-5 rounded-2xl bg-white p-5 shadow-xl sm:left-8">
            <p className="text-2xl font-semibold text-[#C76A34]">140+</p>
            <p className="text-xs text-[#8B8179]">Happy guests served</p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#C76A34]">About HotelPro</p>
          <h2 className="text-3xl font-semibold leading-tight text-[#2E2A27] sm:text-4xl">A better stay starts with the right place.</h2>
          <p className="mt-5 leading-7 text-[#756C65]">HotelPro brings comfortable rooms, attentive service, and simple booking together in one place. Whether you are travelling for work or taking a break, we make it easy to choose a stay that feels like home.</p>
          <p className="mt-4 leading-7 text-[#756C65]">From a warm welcome at reception to a relaxed final checkout, every detail is designed around your comfort.</p>
          <a href="#services" className="mt-7 inline-flex rounded-full bg-[#2E2A27] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#C76A34]">Explore our services</a>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
