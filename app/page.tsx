import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen bg-cover bg-center px-6" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            Transforming <span className="text-blue-400">Mental Health</span> with AI
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Personalized care, expert insights, and impactful programs — all designed to support your mental well-being every step of the way.
          </p>
          <div className="mt-8 space-x-4">
            <Link href="/login">
              <button className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Get Started
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Awareness Programs */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-12">Our Featured Programs</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "Mindfulness Therapy", image: "/mindfulness.png", link: "/programs/mindfulness", desc: "Cultivate calm, clarity, and resilience through guided mindfulness practices." },
            { title: "Depression & Anxiety Support", image: "/depression.jpg", link: "/programs/depression", desc: "Access tailored support, expert advice, and a caring community." },
            { title: "Work-Life Balance", image: "/work-life-balance.jpg", link: "/programs/work-life", desc: "Master strategies to harmonize your personal and professional life." },
          ].map((program) => (
            <div key={program.title} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col items-center text-center">
              <Image src={program.image} alt={program.title} width={100} height={100} className="mb-5" />
              <h3 className="text-2xl font-bold text-blue-600 mb-3">{program.title}</h3>
              <p className="text-gray-600 mb-4">{program.desc}</p>
              <Link href={program.link}>
                <button className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition">
                  Learn More
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-100 py-16 text-center">
        <h2 className="text-4xl font-semibold text-blue-700 mb-12">Our Global Impact</h2>
        <div className="flex justify-center space-x-12">
          {[
            { stat: "98%", label: "Satisfaction Rate" },
            { stat: "500+", label: "Expert Psychologists" },
            { stat: "10K+", label: "Patients Supported" },
          ].map((item) => (
            <div key={item.label}>
              <h3 className="text-5xl font-bold text-blue-700">{item.stat}</h3>
              <p className="text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Experts */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-12">Meet Our Experts</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { name: "Dr. Sarah Williams", role: "Clinical Psychologist" },
            { name: "Dr. Michael Johnson", role: "Therapist & Counselor" },
            { name: "Dr. Emily Davis", role: "Behavioral Specialist" },
          ].map((expert) => (
            <div key={expert.name} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col items-center text-center">
              <Image src="/doctor_image.jpg" alt={expert.name} width={100} height={100} className="rounded-full mb-4" />
              <h3 className="text-xl font-bold text-blue-600">{expert.name}</h3>
              <p className="text-gray-600">{expert.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-blue-100 to-teal-100 py-16">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-12">What Our Users Say</h2>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10">
          {[
            { name: "Ayesha K.", text: "RAISC has truly changed my life. I feel supported, understood, and empowered every day." },
            { name: "John M.", text: "The mindfulness program helped me manage stress and improve my focus at work." },
          ].map((testimonial) => (
            <div key={testimonial.name} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
              <h4 className="text-blue-600 font-bold">{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Articles / Blog */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-semibold text-blue-700 text-center mb-12">Explore Our Resources</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "5 Ways AI is Revolutionizing Mental Health", link: "/blog/ai-mental-health" },
            { title: "How to Build Lasting Resilience", link: "/blog/resilience" },
            { title: "Mindfulness Techniques You Can Start Today", link: "/blog/mindfulness" },
          ].map((article) => (
            <div key={article.title} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-blue-600 mb-3">{article.title}</h3>
              <Link href={article.link}>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                  Read More
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}