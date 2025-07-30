// components/AdminTeamPanel.tsx
"use client";

import { useState } from "react";

type Admin = {
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function AdminTeamPanel() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      name: "Hira Naseer",
      email: "hira@pimh.org",
      role: "Admin / Editor",
      status: "Active",
    },
  ]);

  const [newAdmin, setNewAdmin] = useState<Admin>({
    name: "",
    email: "",
    role: "",
    status: "Active",
  });

  const [showNewAdminForm, setShowNewAdminForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleAddNewAdmin = () => {
    setShowNewAdminForm(true);
  };

  const handleCancel = () => {
    setNewAdmin({ name: "", email: "", role: "", status: "Active" });
    setShowNewAdminForm(false);
  };

  const handleSave = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.role) return;
    setAdmins([...admins, newAdmin]);
    setNewAdmin({ name: "", email: "", role: "", status: "Active" });
    setShowNewAdminForm(false);
  };

  return (
    <div>
      <h1 className="text-2xl text-left font-bold text-heading2 mb-6">Manage Team</h1>

      <div className="bg-[#E9F5FE] rounded-2xl p-8 w-full max-w-4xl border border-blue-300 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading2">Manage Admin Members</h2>
          <button
            onClick={handleAddNewAdmin}
            className="bg-gradient-to-b from-heading2 to-[#131413] hover:bg-heading text-white font-semibold px-4 py-2 rounded-full text-sm"
          >
            + Add New Admin
          </button>
        </div>

        {admins.map((admin, index) => (
          <div
            key={index}
            className="rounded-2xl border border-blue-300 bg-white p-4 w-full mb-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between border-b py-2">
                <span className="font-bold">Name</span>
                <span>{admin.name}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="font-bold">Email</span>
                <span>{admin.email}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="font-bold">Role</span>
                <span>{admin.role}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold">Status</span>
                <span>{admin.status}</span>
              </div>
            </div>
          </div>
        ))}

        {showNewAdminForm && (
          <div className="rounded-2xl border border-blue-300 bg-white p-4 w-full mb-4">
            <div className="space-y-4">
              <div className="flex justify-between border-b py-2">
                <label className="font-bold w-1/2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleChange}
                  className="w-1/2 text-right bg-transparent focus:outline-none"
                  placeholder="Enter name"
                />
              </div>
              <div className="flex justify-between border-b py-2">
                <label className="font-bold w-1/2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleChange}
                  className="w-1/2 text-right bg-transparent focus:outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div className="flex justify-between border-b py-2">
                <label className="font-bold w-1/2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={newAdmin.role}
                  onChange={handleChange}
                  className="w-1/2 text-right bg-transparent focus:outline-none"
                  placeholder="Enter role"
                />
              </div>
              <div className="flex justify-between py-2">
                <label className="font-bold w-1/2">Status</label>
                <span className="w-1/2 text-right">{newAdmin.status}</span>
              </div>
            </div>
          </div>
        )}

        {showNewAdminForm && (
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleSave}
              className="bg-gradient-to-b from-heading2 to-[#131413] hover:bg-heading text-white font-semibold px-6 py-2 rounded-full"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-white border-2 border-heading2 text-heading2 hover:bg-slate-100 font-semibold px-6 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
