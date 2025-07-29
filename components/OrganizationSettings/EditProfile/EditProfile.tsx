interface OrganizationProfileData {
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  location?: string;
  linkedin?: string;
}

interface EditOrganizationProfileProps {
  profile: OrganizationProfileData;
  editingField: string | null;
  tempValue: string;
  message: string;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
  setTempValue: (value: string) => void;
}

export default function EditOrganizationProfile({
  profile,
  editingField,
  tempValue,
  message,
  handleEdit,
  handleSave,
  handleCancel,
  setTempValue
}: EditOrganizationProfileProps) {
  return (
    <div className="max-h-[1200px] overflow-y-auto p-3">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl font-bold text-left text-[#1E3CA7] mb-16">
          Edit Organization Profile
        </h1>
        <div
          className="relative bg-[#E9F5FE] rounded-3xl p-4 flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Logo Section */}
          <div
            className="absolute top-0 -translate-y-1/2 w-[calc(100%-2rem)] bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <img
                    src={profile.logo_url || "/org-logo.png"}
                    alt="Organization Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E3CA7] mb-1">
                    {profile.organization_name || "Organization Name"}
                  </h2>
                  <p className="text-md text-[#1E3CA7]">
                    {profile.location || "Location"}
                  </p>
                </div>
              </div>
              <button className="bg-[#1E3CA7] text-white px-8 py-2 rounded-full text-md font-semibold hover:opacity-70">
                Edit Logo
              </button>
            </div>
          </div>

          {/* Organization Fields */}
          <div
            className="bg-white rounded-2xl mt-10 px-4 py-2 mb-2"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Organization Name */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Organization Name</label>
                {editingField === 'organization_name' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                    />
                    <button
                      onClick={() => handleSave('organization_name')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-md text-[#444444] mt-1">{profile.organization_name || "Organization Name"}</p>
                )}
              </div>
              {editingField !== 'organization_name' && (
                <button
                  onClick={() => handleEdit('organization_name', profile.organization_name || "")}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Description */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Description</label>
                {editingField === 'description' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                    />
                    <button
                      onClick={() => handleSave('description')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-md text-[#444444] mt-1">{profile.description || "Description"}</p>
                )}
              </div>
              {editingField !== 'description' && (
                <button
                  onClick={() => handleEdit('description', profile.description || "")}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Contact Email */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Contact Email</label>
                {editingField === 'contact_email' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="email"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                    />
                    <button
                      onClick={() => handleSave('contact_email')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-md text-[#444444] mt-1">{profile.contact_email || "Contact Email"}</p>
                )}
              </div>
              {editingField !== 'contact_email' && (
                <button
                  onClick={() => handleEdit('contact_email', profile.contact_email || "")}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Contact Numbers */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Contact Numbers</label>
                <p className="text-md text-[#444444] mt-1">
                  {(profile.contact_numbers && profile.contact_numbers.length > 0)
                    ? profile.contact_numbers.join(", ")
                    : "Contact Numbers"}
                </p>
              </div>
              {/* You can add edit logic for contact_numbers if needed */}
            </div>

            {/* Location */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Location</label>
                {editingField === 'location' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                    />
                    <button
                      onClick={() => handleSave('location')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-md text-[#444444] mt-1">{profile.location || "Location"}</p>
                )}
              </div>
              {editingField !== 'location' && (
                <button
                  onClick={() => handleEdit('location', profile.location || "")}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {/* LinkedIn */}
            <div className="flex justify-between items-center py-2">
              <div>
                <label className="text-base font-bold text-[#444444]">LinkedIn</label>
                <p className="text-md text-[#444444] mt-1">{profile.linkedin || "LinkedIn"}</p>
              </div>
              {/* You can add edit logic for linkedin if needed */}
            </div>
          </div>

          {message && (
            <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-lg text-center text-md">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}