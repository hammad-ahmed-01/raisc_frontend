"use client";

import React from "react";

const Card = ({ image, heading, description, onLearnMore }) => {
  return (
    <div className="p-[2px] rounded-2xl bg-gradient-to-b from-[#1E3CA7] via-[#DBE3FF] to-[#0C1741] shadow-blue-500">
      <div className="bg-white rounded-2xl p-6 flex flex-col h-full">
        <img
          src={image}
          alt={heading}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
        <h3 className="text-lg text-heading font-semibold mb-2">{heading}</h3>
        <p className="flex-grow text-normal mb-4">{description}</p>
        <div className="flex justify-center mt-auto pt-2">
          <button
            onClick={onLearnMore}
            className="text-sm bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-4 py-1.5 rounded-full hover:opacity-90 shadow-sm"
          >
            More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
