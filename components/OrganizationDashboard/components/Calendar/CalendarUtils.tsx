import { format } from "date-fns";
import React from "react";

export const eventPropGetter = (event: any) => {
  return {
    style: {
      backgroundColor: event.color || "#ccc",
      color: "#1E3CA7",
      borderRadius: "4px",
      border: "1px solid #2196F3",
      padding: "2px 4px",
      fontWeight: 600,
    },
  };
};

export const dayPropGetter = (date: Date, currentDate: Date) => {
  const isSelected = format(date, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
  const isOtherMonth = date.getMonth() !== currentDate.getMonth();

  const style: React.CSSProperties = {
    backgroundColor: isSelected ? "#E8FAF7" : isOtherMonth ? "#D8E0EA" : "#fff",
    color: "#1E3CA7",
    fontWeight: 600,
    textAlign: "center",
    paddingTop: 4,
    border: "1px solid #2196F3",
  };

  return {
    className: "relative text-heading2",
    style,
  };
};

export function CustomToolbar({ label, onNavigate, setView }: any) {
  return (
    <div className="custom-toolbar">
      <div className="toolbar-left">
        <button className="bg-[#D0E9FF] text-heading2 hover:text-heading" onClick={() => onNavigate("PREV")}>&lt;</button>
        <span>{label}</span>
        <button className="bg-[#D0E9FF] text-heading2 hover:text-heading" onClick={() => onNavigate("NEXT")}>&gt;</button>
      </div>
      <div className="toolbar-right">
        {["month", "week", "day"].map((v) => (
          <button className="h-full" key={v} onClick={() => setView(v)}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
