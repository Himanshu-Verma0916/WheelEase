import React from "react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="mt-10 w-full bg-[#0F0F0F] border-t border-gray-800 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between ">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 object-cover rounded-full bg-white p-1"
          />
          <h3 className="text-gray-300 font-semibold text-lg">
            Wheelchair Guidance & Assistance
          </h3>
        </div>

        {/* Right Section */}
        <p className="text-sm text-gray-500 whitespace-nowrap ">
          © {new Date().getFullYear()} Wheelchair Assist. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;
