import React from "react";

const ServiceCard = ({ title, img, onClick, selected }) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl cursor-pointer 
        transition-all duration-300 border
        ${selected ? "border-blue-400 bg-[#0c1a28]" : "border-gray-700 hover:bg-[#191919]"}
      `}
    >
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${img})` }}
      ></div>

      <div>
        <h3 className="font-medium text-sm sm:text-base">{title}</h3>
        <p className="text-gray-400 text-xs sm:text-sm">View details</p>
      </div>
    </div>
  );
};

export default ServiceCard;
