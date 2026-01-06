import { Lock } from "lucide-react";

export default function OurMissionSection() {
  return (
    <section className="bg-blue-50 min-h-screen bg-no-repeat bg-cover py-20 text-center">
      {/* Section Heading */}
      <h3 className="text-4xl font-bold mb-6 text-heading">
        Our Mission
      </h3>

      {/* Mission Text Box */}
      <div className="bg-white mx-auto w-11/12 md:w-3/4 rounded-lg shadow-md p-6 text-gray-700">
        <p>
          At RAISC, we are dedicated to making mental healthcare accessible,
          effective, and personalized for everyone. Our platform connects
          patients with qualified mental health professionals, providing a safe
          and supportive environment for healing and growth. We believe in the
          power of technology to transform mental healthcare delivery, making it
          more accessible and effective while maintaining the human touch that
          is essential for healing.
        </p>
      </div>

      {/* Why Choose Section */}
      <div className="mt-16 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-heading2 mb-10 text-center">
          Why Choose RAISC?
        </h3>

        {/* Purple Container */}
        <div className="bg-[#E6E6FA] py-10 px-4 rounded-xl max-w-5xl w-full shadow-lg flex justify-center">
          {/* Cards Wrapper */}
          <div className="flex flex-wrap justify-center gap-8">
            {/* Card 1 */}
            <div className="bg-white w-72 rounded-lg shadow-lg border border-[#2196F3] text-center p-6">
              <img
                src="/doc.png"
                alt="Professional Network"
                className="w-20 h-20 mx-auto mb-4 border-heading2 rounded-full border-2"
              />
              <h4 className="font-bold text-heading2 mb-2">
                Professional Network
              </h4>
              <p className="text-gray-600">
                Connect with qualified mental health professionals who are
                committed to your well-being.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white w-72 rounded-lg shadow-lg border border-[#2196F3] text-center p-6">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#D7E2FE" }}
              >
                <Lock className="w-12 h-12 font-semibold text-heading2" />
              </div>
              <h4 className="font-bold text-heading2 mb-2">
                Secure Platform
              </h4>
              <p className="text-gray-600">
                Your privacy and security are our top priorities, with end-to-end
                encryption and strict confidentiality.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white w-72 rounded-lg shadow-lg border border-[#2196F3] text-center p-6">
              <img
                src="/personalizedcare.png"
                alt="Personalized Care"
                className="w-full h-20 mx-auto rounded-full mb-4"
              />
              <h4 className="font-bold text-heading2 mb-2">
                Personalized Care
              </h4>
              <p className="text-gray-600">
                Receive tailored treatment plans and support based on your
                unique needs and goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
