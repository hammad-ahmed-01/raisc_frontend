import { Doctor } from "@/app/settings/account/page";
import Image from "next/image";

interface DoctorProps {
  doctor: Doctor;
}

export default function MyAccount({doctor}:DoctorProps) {

return (
    <div className="h-full overflow-hidden p-5">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-left text-[#1E3CA7] mb-16">
          My Account
        </h1>

        {/* Account Detail Section - Single container */}
        <div
          className="bg-[#E9F5FE] rounded-3xl p-5 relative flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Doctor Profile Header - Inside Account Detail */}
          <div
            className="bg-white rounded-2xl p-5 mb-5 absolute top-0 -translate-y-1/2 w-[calc(100%-2.5rem)]"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <Image
                    src="/doc.png"
                    alt="Doctor"
                    className="w-full h-full object-cover"
                    width={56}
                    height={56}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E3CA7] mb-1">
                    {doctor.display_name || doctor.username}
                  </h2>
                  <p className="text-base text-[#1E3CA7] font-normal">
                    Cognitive Therapy
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">⭐</span>
                  <span className="text-base font-bold text-[#1E3CA7]">
                    {doctor.rating} Rating
                  </span>
                </div>
                <p className="text-md font-normal text-[#444444]">
                  Member Since {doctor.member_since}
                </p>
              </div>
            </div>
          </div>

          {/* Account Detail Header */}
          <div className="flex items-center justify-between pt-10 mb-4">
            <h3 className="text-xl font-bold text-[#1E3CA7]">Account Detail</h3>
            <span className="text-md font-normal text-[#444444]">
              Last Login: {doctor.last_login}
            </span>
          </div>

          <div className="flex gap-5 mb-5">
            {/* Left Column - Takes 60% width with all fields */}
            <div
              className="w-[60%] bg-white rounded-xl p-4 space-y-4"
              style={{ border: "1px solid #2196F3" }}
            >
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Display Name
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {doctor.display_name || doctor.username}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Username
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {doctor.username}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-base font-normal mb-0 text-[#444444]">
                    {doctor.email}
                  </p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {doctor.emailVerified}
                  </span>
                </div>
              </div>

              {/* Add Phone Number */}
              <div className="flex justify-start">
                <button className="text-[#1E3CA7] p-0 text-md bg-transparent text-left font-semibold hover:underline">
                  Add a phone number
                </button>
              </div>
            </div>

            {/* Right Column - Takes 40% width and matches left column height */}
            <div className="w-[40%] flex flex-col gap-4">
              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] block mb-3 text-center">
                  Affiliated Organization
                </label>
                <div className="text-center">
                  <p className="text-base font-normal text-[#444444] mb-1">
                    {doctor.organization}
                  </p>
                  <p className="text-md font-normal text-[#444444]">
                    {doctor.location}
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] text-center">
                  Patients Assigned: {doctor.patients_assigned}
                </label>
              </div>
            </div>
          </div>

          {/* Qualification Section */}
          <div
            className="bg-white rounded-xl p-4 mb-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <h3 className="text-xl font-bold text-[#444444] mb-4">
              Qualification
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                {doctor.qualifications?.map((qual, index) => (
                  <p key={index} className="text-base font-normal text-[#444444]">
                    {qual}
                  </p>
                ))}
              </div>

              <div className="text-right space-y-1">
                <p className="text-base font-semibold text-[#444444]">
                  {doctor.university}: {doctor.graduation_year}
                </p>
                <p className="text-base font-semibold text-[#444444]">
                  {doctor.university}: 2024
                </p>
              </div>
            </div>
          </div>

          {/* Update Profile Link */}
          <div className="text-center">
            <p className="text-md font-normal text-[#1E3CA7]">
              Want to update your details?{" "}
              <a
                href="/settings/edit-profile"
                className="underline font-semibold"
              >
                Go to Edit Profile
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}