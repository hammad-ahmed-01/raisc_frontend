"use client";

import React from "react";

interface CardProps {
  image: string;
  heading: string;
  description: string;
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({ image, heading, description, backgroundColor = "#ffffff" }) => {
  return (
    <div
      className="mt-8 rounded-2xl border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-2"
      style={{
        borderColor: "#2196F3",
        borderWidth: "2px",
        boxShadow: "0px 4px 4px 0px #00000040",
        borderBottom: "5px solid #D0E3FFC7",
      }}
    >
      <div
        className="rounded-2xl p-8 flex flex-col h-full"
        style={{ backgroundColor }}
      >
        <img
          src={image}
          alt={heading}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
        <h3 className="text-lg text-heading font-semibold mb-2">{heading}</h3>
        <p className="flex-grow text-normal">{description}</p>
      </div>
    </div>
  );
};

export default Card;
