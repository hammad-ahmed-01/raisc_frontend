import { Patient } from "@/app/settings/account/page";

interface PatientProps {
  patient: Patient;
}

export default function MyAccount({ patient }: PatientProps) {
  return (
    <div className="h-full overflow-hidden p-4">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-left text-[#1E3CA7] mb-4">
          My Account
        </h1>

        {/* Main Account Container */}
        <div
          className="bg-[#E6F3FF] rounded-2xl p-4 relative flex-1 overflow-y-auto"
          style={{ border: "1px solid #87CEEB" }}
        >
          {/* Patient Profile Header */}
          <div className="flex items-center justify-between mb-4 p-4 rounded-2xl">
            <div className="flex items-center space-x-3">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <img
                    src="/patient.png"
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3CA7]">
                  {patient.displayName || "Ayesha Khan"}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-normal text-[#444444]">
                Last Login: {patient.lastLogin || "17 July,2025"}
              </span>
            </div>  
          </div>

          {/* Account Detail Section */}
          <div
            className="bg-white rounded-2xl py-4 mb-4"
            style={{ border: "1px solid #87CEEB" }}
          >
            <h3 className="px-4 text-lg font-bold text-[#1E3CA7] mb-4">
              Account Detail
            </h3>

            <div className="px-4 space-y-3 bg-[#F0F9FFC7] py-4" style={{ borderTop: "1px solid #2196F3", borderBottom: "1px solid #2196F3" }}>
              <div className="flex justify-between items-center py-1">
                <span className="text-base font-semibold text-[#000000]">
                  Display Name
                </span>
                <span className="text-base font-normal text-[#444444]">
                  {patient.displayName || "Ayesha"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-base font-semibold text-[#000000]">Username</span>
                <span className="text-base font-normal text-[#444444]">
                  {patient.username || "Ayesha_123"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-base font-semibold text-[#000000]">Email</span>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-normal text-[#444444]">
                    {patient.email || "Ayesha123@gmail.com"}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <span className="text-green-600 mr-1">✓</span>
                    Verified
                  </span>
                </div>
              </div>
            </div>
        
            <div className="pt-2">
            <button className="text-[#1E3CA7] px-4 bg-transparent text-base font-semibold hover:underline">
                Add a phone number
            </button>
            </div>        
          </div>

          {/* Bottom Section with Therapy Focus and Sessions */}
          <div className="flex gap-4 mb-4">
            <div
              className="flex-1 bg-white rounded-2xl p-4"
              style={{ border: "1px solid #87CEEB" }}
            >
              <h4 className="text-base font-bold text-[#000000] mb-2">Therapy Focus</h4>
              <p className="text-sm font-normal text-[#444444]">
                {patient.therapyFocus || "Managing Stress and Anxiety."}
              </p>
            </div>

            <div
              className="flex-1 bg-white rounded-2xl p-4"
              style={{ border: "1px solid #87CEEB" }}
            >
              <h4 className="text-base font-bold text-[#000000] mb-2">
                Sessions Completed: {patient.sessionsCompleted || "4"}
              </h4>
              <p className="text-sm font-normal text-[#444444]">
                Last Session: {patient.lastSession || "17 July,2025"}
              </p>
            </div>
          </div>

          {/* Bottom Link - Positioned at the bottom of container */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-base font-normal text-[#1E3CA7]">
              Want to update your details?{" "}
              <a
                href="/settings/edit-profile"
                className="underline font-semibold hover:text-[#3A59AD]"
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