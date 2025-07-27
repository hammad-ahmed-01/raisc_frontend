interface SessionBadgeProps {
  doctor: string;
  therapy: string;
  time: string;
  color: string; // hex string like "#F99B9B"
}

const SessionBadge: React.FC<SessionBadgeProps> = ({ doctor, therapy, time, color }) => {
  return (
    <div className="flex items-center gap-4 w-full sm:w-1/2 mb-4">
      <div
        className="w-5 h-5 rounded-md"
        style={{ backgroundColor: color }}
      ></div>
      <div>
        <div className="text-[#1E3CA7] font-bold text-base">{doctor}</div>
        <div className="text-[#1E3CA7] text-sm">{therapy}</div>
        <div className="text-[#1E3CA7] text-sm">{time}</div>
      </div>
    </div>
  );
};

export default SessionBadge;
