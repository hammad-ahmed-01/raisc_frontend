import { Patient } from "@/app/settings/account/page";

interface PatientProps {
  patient: Patient;
}

export default function MyAccount({ patient }: PatientProps) {
  return (
    <div className="h-full overflow-hidden p-5">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-left text-[#1E3CA7] mb-16">
          My Account
        </h1>

        <div
          className="bg-[#E9F5FE] rounded-3xl p-5 relative flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Patient Profile Header */}
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
                  <img
                    src="/patient-avatar.png"
                    alt="Patient"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E3CA7] mb-1">
                    {patient.displayName}
                  </h2>
                  <p className="text-base text-[#1E3CA7] font-normal">
                    Patient
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-1">
                  <span className="text-base font-bold text-[#1E3CA7]">
                    Sessions: {patient.sessionsCompleted}
                  </span>
                </div>
                <p className="text-md font-normal text-[#444444]">
                  Last Session: {patient.lastSession}
                </p>
              </div>
            </div>
          </div>

          {/* Account Detail Header */}
          <div className="flex items-center justify-between pt-10 mb-4">
            <h3 className="text-xl font-bold text-[#1E3CA7]">Account Detail</h3>
            <span className="text-md font-normal text-[#444444]">
              Last Login: {patient.lastLogin}
            </span>
          </div>

          <div className="flex gap-5 mb-5">
            {/* Left Column */}
            <div
              className="w-[60%] bg-white rounded-xl p-4 space-y-4"
              style={{ border: "1px solid #2196F3" }}
            >
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Display Name
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {patient.displayName}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Username
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {patient.username}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-base font-normal mb-0 text-[#444444]">
                    {patient.email}
                  </p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {patient.emailVerified ? "✓ Verified" : "Not Verified"}
                  </span>
                </div>
              </div>

              <div className="flex justify-start">
                <button className="text-[#1E3CA7] p-0 text-md bg-transparent text-left font-semibold hover:underline">
                  Add a phone number
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-[40%] flex flex-col gap-4">
              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] block mb-3 text-center">
                  Therapy Focus
                </label>
                <div className="text-center">
                  <p className="text-base font-normal text-[#444444]">
                    {patient.therapyFocus}
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] text-center">
                  Sessions Completed: {patient.sessionsCompleted}
                </label>
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
