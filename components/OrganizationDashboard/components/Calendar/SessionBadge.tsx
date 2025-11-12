interface SessionBadgeProps {
  doctor: string;
  therapy: string;
  time: string;
  color: string;
}

const SessionBadge: React.FC<SessionBadgeProps> = ({
  doctor,
  therapy,
  time,
  color,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-1/2 mb-4 text-center sm:text-left">
      <div
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md mx-auto sm:mx-0"
        style={{ backgroundColor: color }}
      ></div>
      <div>
        <div className="text-[#1E3CA7] font-bold text-base sm:text-lg">
          {doctor}
        </div>
        <div className="text-[#1E3CA7] text-sm sm:text-base">{therapy}</div>
        <div className="text-[#1E3CA7] text-xs sm:text-sm">{time}</div>
      </div>
    </div>
  );
};

export default SessionBadge;
