import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-100 to-teal-100 min-h-screen mt-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-6">
        <h1 className="text-5xl font-bold text-blue-700 mb-4">
          Welcome to RAISC
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
          Revolutionizing Mental Health through AI. Discover <span className="font-bold text-blue-700">personalized support</span>,
          expert psychologists, and comprehensive <span className="font-bold text-blue-700">awareness programs</span> tailored to your needs.
        </p>
        <Link href="/login">
          <button className="mt-6 px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md transition duration-300 hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
            Get Started
          </button>
        </Link>
      </section>

      {/* Mental Health Awareness Programs */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-10">
          Our Awareness Programs
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Program Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image
              src="/mindfulness.png"
              alt="Mindfulness Therapy"
              width={80}
              height={80}
              className="mb-4"
            />
            <h3 className="text-xl font-bold text-blue-600 mb-2">Mindfulness Therapy</h3>
            <p className="text-gray-600">
              Learn how mindfulness can reduce stress and improve mental clarity.
            </p>
            <Link href="/programs/mindfulness">
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                Learn More
              </button>
            </Link>
          </div>

          {/* Program Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image
              src="/depression.jpg"
              alt="Depression & Anxiety Support"
              width={80}
              height={80}
              className="mb-4"
            />
            <h3 className="text-xl font-bold text-blue-600 mb-2">Depression & Anxiety Support</h3>
            <p className="text-gray-600">
              Find expert advice and community support for mental health challenges.
            </p>
            <Link href="/programs/depression">
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                Learn More
              </button>
            </Link>
          </div>

          {/* Program Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image
              src="/work-life-balance.jpg"
              alt="Work-Life Balance"
              width={80}
              height={80}
              className="mb-4"
            />
            <h3 className="text-xl font-bold text-blue-600 mb-2">Work-Life Balance</h3>
            <p className="text-gray-600">
              Improve your work-life balance with tailored wellness strategies.
            </p>
            <Link href="/programs/work-life">
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Impact - Statistics */}
      <section className="bg-blue-50 py-16 text-center">
        <h2 className="text-4xl font-semibold text-blue-700 mb-8">Our Impact</h2>
        <div className="flex justify-center space-x-8">
          <div>
            <h3 className="text-5xl font-bold text-blue-700">98%</h3>
            <p className="text-gray-600">Patient Satisfaction</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-blue-700">500+</h3>
            <p className="text-gray-600">Certified Psychologists</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-blue-700">10K+</h3>
            <p className="text-gray-600">Patients Helped</p>
          </div>
        </div>
      </section>

      {/* Meet Our Psychologists */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-8">
          Meet Our Experts
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image src="/doctor_image.jpg" alt="Dr. Sarah Williams" width={100} height={100} className="rounded-full mb-3" />
            <h3 className="text-xl font-bold text-blue-600">Dr. Sarah Williams</h3>
            <p className="text-gray-600">Clinical Psychologist</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image src="/doctor_image.jpg" alt="Dr. Michael Johnson" width={100} height={100} className="rounded-full mb-3" />
            <h3 className="text-xl font-bold text-blue-600">Dr. Michael Johnson</h3>
            <p className="text-gray-600">Therapist & Counselor</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <Image src="/doctor_image.jpg" alt="Dr. Emily Davis" width={100} height={100} className="rounded-full mb-3" />
            <h3 className="text-xl font-bold text-blue-600">Dr. Emily Davis</h3>
            <p className="text-gray-600">Behavioral Specialist</p>
          </div>
        </div>
      </section>
    </div>
  );
}
