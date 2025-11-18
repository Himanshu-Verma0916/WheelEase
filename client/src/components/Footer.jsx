import React from "react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="mt-10 mb-0 w-full bg-[#0F0F0F] border-t border-gray-800 py-2 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left Section - Logo + Name */}
        <div className="flex items-center  gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 object-cover rounded-full bg-white p-1"
          />
          <h3 className="text-gray-300 font-semibold text-lg whitespace-nowrap">
            Wheelchair Guidance & Assistance
          </h3>
        </div>

        {/* Right Section - Copyright */}
        <p className="text-sm text-gray-500 text-center sm:text-right">
          © {new Date().getFullYear()} Wheelchair Assist. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;
