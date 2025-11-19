import React, { useState } from "react";
import { IoClose, IoLocationSharp } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import SuccessSosPopup from "./SuccessSosPopup";

const SosAlert = ({ onClose,onSend, location }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSend = () => {
    // simulate API call
    console.log("Sending alert...");
    
    // after success
    setShowSuccess(true);
    
      // notify MapMock
    if (onSend){
      onSend();
    } 
  };

  return (
    <>
      {/* MAIN SOS POPUP */}
      {!showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">

            {/* Header */}
            <div className="bg-red-600 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Emergency SOS</h2>
                <p className="text-sm opacity-90 -mt-1">
                  Immediate assistance activated
                </p>
              </div>
              <button onClick={onClose} className="text-white text-2xl">
                <IoClose />
              </button>
            </div>

            {/* Info */}
            <div className="bg-yellow-50 border border-yellow-200 mx-5 mt-5 p-4 rounded-lg text-sm text-gray-700">
              Your emergency alert will be sent with your current location.
            </div>

            {/* Location */}
            <div className="mx-5 mt-4 p-4 rounded-xl bg-gray-100 flex gap-3 items-start">
              <IoLocationSharp className="text-blue-500 text-2xl" />
              <div>
                <p className="font-semibold text-gray-800">Your Current Location</p>
                <p className="text-gray-600 text-sm">
                  Lat: {location.lat}, Lng: {location.lng}
                </p>
              </div>
            </div>

            {/* Contacts */}
            <p className="mx-5 mt-5 mb-2 text-gray-700 font-semibold">
              Alert will be sent to:
            </p>

            {[
              {
                name: "Central Police Station",
                phone: "+254-20-9999999",
                icon: "👮‍♂️",
              },
              {
                name: "Disability Rights NGO",
                phone: "+254-20-5555555",
                icon: "🤝",
              },
              {
                name: "Community Support Center",
                phone: "+254-20-4444444",
                icon: "🤝",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="mx-5 mt-3 p-4 rounded-xl border bg-gray-50 flex items-center gap-3"
              >
                <div className="text-3xl">{c.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-blue-600 text-sm flex items-center gap-1">
                    <FaPhoneAlt className="text-xs" /> {c.phone}
                  </p>
                </div>
              </div>
            ))}

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="w-full bg-red-600 text-white py-4 mt-6 text-lg font-semibold hover:bg-red-700 transition"
            >
              🚨 Send Emergency Alert
            </button>

          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <SuccessSosPopup
          onClose={() => {
            setShowSuccess(false);
            onClose(); // closes main popup also
          }}
        />
      )}
    </>
  );
};

export default SosAlert;
