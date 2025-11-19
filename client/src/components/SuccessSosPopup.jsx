import React from "react";
import { IoClose } from "react-icons/io5";

const SuccessSosPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-24 z-50 px-4">
      <div className="bg-white max-w-lg w-full rounded-xl shadow-lg overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="bg-green-600 text-white px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Alert Sent Successfully!</h2>
            <p className="text-sm opacity-90 -mt-1">
              Emergency services have been notified
            </p>
          </div>
          <button onClick={onClose} className="text-white text-2xl">
            {/* comment  */}
            <IoClose />
          </button>
        </div>

        {/* Success Box */}
        <div className="bg-green-50 border border-green-200 mx-5 mt-5 p-5 text-center rounded-lg">
          <span className="text-green-600 text-5xl">✔</span>
          <h3 className="text-xl font-semibold text-green-700 mt-2">
            Alert Sent Successfully!
          </h3>
          <p className="text-green-600 text-sm mt-1">
            Emergency services have been notified of your location.
          </p>
        </div>

        <div className="h-6"></div>
      </div>
    </div>
  );
};

export default SuccessSosPopup;
