import React from 'react';
import FeatureCard from './FeatureCard';
import Button from './Button';
import Link from 'next/link';

const AboutRAISC: React.FC = () => {
  return (
    <section className="py-12 px-4 md:px-16 text-gray-800">
      {/*
      <div className="mb-8">
         <img
           src="/about.png" 
           alt="Services Icon"
           className="mx-auto w-20 h-20"
         />
      </div>
      */}
      <h2 className="text-2xl md:text-3xl text-center font-extrabold text-heading">About RAISC</h2>
      <p className="text-heading2 text-center font-semibold mt-2">Empowering mind through technology and compassion</p>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200">

        <div className="grid md:grid-cols-2 gap-6 items-start text-left">
          {/* Left Column */}
          <div>
            <p className="mb-4">
              At RAISC, we are dedicated to making mental healthcare accessible, effective, and personalized for everyone.
            </p>
            <p className="mb-4">
              Our platform connects patients with qualified mental health professionals, providing a safe and supportive environment for healing and growth.
            </p>
            <p className="mb-6">
              We believe in the power of technology to transform mental healthcare delivery, making it more accessible and effective while maintaining the human touch that is essential for healing.
            </p>

            <p className="font-medium mb-4">Ready to start your journey?</p>
            <div className="flex flex-wrap gap-4">
                <Link href="/production" passHref>
                  <Button text="Get Started Today" variant="primary" />
                </Link>
                <Link href="/about" passHref>
                    <Button text="Learn More About Us" variant="secondary" />
                </Link>
                </div>
            </div>

          {/* Right Column */}
          <div>
            <div className="bg-pink-100 w-full text-pink-900 text-lg text-center font-bold py-3 px-5 rounded-xl shadow-md mb-6">
              Why RAISC?
            </div>

            <div className="flex flex-col gap-4">
              <FeatureCard icon="🧠" text="Evidence-based methods" />
              <FeatureCard icon="👩‍⚕️" text="Certified therapists" />
              <FeatureCard icon="💙" text="Compassion-first approach" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutRAISC;
