function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-[#211C19] py-20 text-white sm:py-24">
      <img src="/landing/experience_section.jpg" alt="Hotel experience" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-[#211C19]/65" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E4B07A]">The HotelPro experience</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Slow down. Settle in. Enjoy the stay.</h2>
          <p className="mt-5 max-w-xl leading-7 text-white/75">Relax in thoughtfully prepared rooms, enjoy easy dining options, and let our team take care of the details while you focus on the moments that matter.</p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-5 sm:grid-cols-4">
            <div><p className="text-2xl font-semibold">140+</p><p className="mt-1 text-xs text-white/60">Guests</p></div>
            <div><p className="text-2xl font-semibold">24/7</p><p className="mt-1 text-xs text-white/60">Support</p></div>
            <div><p className="text-2xl font-semibold">3</p><p className="mt-1 text-xs text-white/60">Room types</p></div>
            <div><p className="text-2xl font-semibold">4.9</p><p className="mt-1 text-xs text-white/60">Guest rating</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExperienceSection;
