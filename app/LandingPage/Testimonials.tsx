import React from 'react';

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="text-center px-4 py-16">
      <h2 className="inline-block px-8 py-3 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md mb-[6px]">
        What Our Clients Say
      </h2>
      <h2 className="text-heading2 mb-2 max-w-xl mx-auto">
        Real stories from people who have transformed their lives through our platform.
      </h2>
      <div className="bg-gradient-to-r from-[#1E3CA7] via-[#DBE3FF] to-[#0C1741] p-4 rounded-[40px] max-w-3xl mx-auto">
        <div className="bg-white rounded-[36px] p-8 text-center">
          <p className="text-normal text-lg leading-relaxed">
            "RAISC has been life-changing for me. The therapist I was matched with understood my anxiety issues perfectly,
            and I've made more progress in three months than I did in years of trying to manage on my own."
          </p>
          <p className="text-normal mt-4 font-medium">Sarah J.</p>
          <p className="text-normal">Anxiety Management</p>
        </div>
      </div>

    </section>
  );
}