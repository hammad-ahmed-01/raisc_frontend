export default function AboutUsSection() {
  return (
    <section className="bg-[url('/bg/AboutPagebg.png')] bg-no-repeat min-h-screen bg-cover py-32 text-center">
      <h2 className="text-4xl font-extrabold text-heading">About Us</h2>
      <p className="text-heading2 text-semibold mt-8">
        Revolutionizing mental healthcare through innovative technology and compassionate care.
      </p>

      <div className="mt-10">
        <h3 className="text-2xl text-heading2 font-bold mb-12">💡 Our Values</h3>
        <div className="flex justify-center gap-8 flex-wrap">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#FFF8EC99] shadow-md px-6 py-3 rounded-full text-black">
              ✓ Innovation in Healthcare
            </div>
            <div className="bg-[#FFF8EC99] shadow-md px-6 py-3 rounded-full text-black">
              ✓ Accessibility for All
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#FFF8EC99] shadow-md px-6 py-3 rounded-full text-black">
              ✓ Compassionate Care
            </div>
            <div className="bg-[#FFF8EC99] shadow-md px-6 py-3 rounded-full text-black">
              ✓ Privacy and Security
            </div>
          </div>
        </div>
        <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] mt-32 text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
          Join Our Mission
        </button>
      </div>
    </section>
  );
}
