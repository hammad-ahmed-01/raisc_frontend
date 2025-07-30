"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, X } from "lucide-react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export default function CreateSessionForm() {
  const [sessionType, setSessionType] = useState("Follow-up");
  const [time, setTime] = useState("2:00 PM");
  const [date, setDate] = useState("2025-07-16");
  const [patientName, setPatientName] = useState("Ayesha Khan");
  const [attachments, setAttachments] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#E6E6FA] border-[#2196F3] rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-heading mb-4">
        Create New session
      </h2>

      <h3 className="text-md font-semibold text-heading mb-4">
        Session Information
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-normal mb-1">Patient</label>
          <Input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <label className="block text-sm text-normal mb-1">Session Type</label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option>Follow-up</option>
            <option>Initial</option>
            <option>Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-normal mb-1">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <label className="block text-sm text-normal mb-1">Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option>2:00 PM</option>
            <option>3:00 PM</option>
            <option>4:00 PM</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-normal mb-1">Session Notes</label>
        <Textarea
          placeholder="Add objectives, concern or focus area for this session..."
          rows={3}
          className="bg-white"
        />
      </div>

      {/* Attachment Section */}
      <div className="mt-4">
        <label className="block text-sm text-normal mb-1">Attachments (optional)</label>
        <div
          onClick={handleBrowseClick}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 bg-white text-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          Drag and drop files here, or{" "}
          <span className="text-blue-600 font-medium ml-1">Browse</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {attachments.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-normal rounded-full p-1 hover:bg-gray-200"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <SecondaryButton
          text="Cancel"
          className="px-10 py-2 rounded-full flex items-center text-center font-semibold"
          />

        <PrimaryButton 
          text="Create Session" 
          className="px-4 py-2 rounded-full flex items-center text-center font-semibold" 
          />
      </div>
    </div>
  );
}
