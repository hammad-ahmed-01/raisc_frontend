import { Users } from 'lucide-react';

export default function OurTeamSection() {
  return (
    <section className="bg-[#FFF8ECDB] min-h-screen py-20 text-center">
      <h3 className="text-3xl font-bold text-heading mb-4">👥 Our Team</h3>
      <p className="text-normal font-semibold max-w-2xl mx-auto mb-10">
        Behind RAISC is a dedicated team of healthcare professionals, technologists,
        and mental health advocates working together to make a difference in people’s lives.
      </p>

      <div className="flex flex-wrap justify-center gap-10">
        {[
          {
            title: 'Healthcare Experts',
            description: 'Licensed professionals with years of experience in mental healthcare.',
            image: '/doc.png',
            border: true
          },
          {
            title: 'Developers Team',
            description: 'Skilled developers creating secure and user-friendly solutions.',
            image: '/laptop.png',
            border: false
          },
          {
            title: 'Support Staff',
            description: 'Dedicated professionals ensuring smooth operations and user support.',
            icon: true
          }
        ].map(({ title, description, image, icon, border }) => (
          <div
            key={title}
            className="bg-[#E9F5FE] w-72 h-72 rounded-full shadow-md flex flex-col items-center justify-center p-4"
          >
            {icon ? (
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#D7E2FE] mb-2">
                <Users className="w-10 h-10 text-blue-700" />
              </div>
            ) : (
              <img
                src={image}
                alt={title}
                className={`w-24 h-24 rounded-full object-cover mb-2 ${
                  border ? 'border-heading2 border-2' : ''
                }`}
              />
            )}
            <h4 className="font-bold text-heading2 text-lg mb-1">{title}</h4>
            <p className="text-sm text-gray-700 px-4 text-center">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
