import React, { useState, useEffect } from "react";
import assets from "../assets/assets";
import SosAlert from "./SosAlert";
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';


const MapMock = ({ selectedTitle, selectedImg }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const { isSignedIn, user } = useUser(); // 👉 Function called when "Send Alert" is clicked

  // 👉 Function called when "Send Alert" is clicked
  const handleSendAlert = () => {
    // // Close popup
    // setTimeout(()=>{
    //    setShowAlert(false);
    // },2000)

    // You can add toast or something later if needed
    console.log("Alert sent successfully!");
  };

  // 👉 Fetch real GPS location
   useEffect(() => {
      if (isSignedIn) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, });
          });
        } else {
          setUserLocation({ lat: null, lng: null });
        }
      }
    }, [isSignedIn]);

  useEffect(() => {
    console.log("current user location is :", userLocation);
  }, [userLocation, isSignedIn]);

  return (
    <div
      className="
      w-full 
      h-[450px] sm:h-[550px] lg:h-[650px] 
      rounded-2xl border border-gray-700 
      bg-[#111] relative overflow-hidden
    "
    >
      {/* 🔥 SOS POPUP OVERLAY */}
      {showAlert && (
        <SosAlert
          onClose={() => setShowAlert(false)}
          onSend={handleSendAlert}
          location={userLocation}
        />
      )}

      {/* Top Badge */}
      <div className="absolute top-4 left-4 bg-[#1a1a1a] border border-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
        2 locations nearby
      </div>

      {/* Grid BG */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff0f 1px, transparent 1px), linear-gradient(90deg, #ffffff0f 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center Pointer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-gray-500 shadow"></div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-[#1a1a1a] border border-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm flex items-start sm:items-center gap-3 w-[140px] sm:w-auto">
        <div>
          <p className="text-gray-400 font-medium mb-1">Map Legend</p>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-4 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url(${selectedImg})` }}
            ></div>
            <span className="text-gray-500">{selectedTitle}</span>
          </div>
        </div>
      </div>

      {/* ALERT BUTTON */}
      <div className="absolute bottom-4 right-4">
        <div
          onClick={() => {
            setShowAlert(true);
          }}
          className="
            relative 
            w-14 h-14 sm:w-20 sm:h-20 
            rounded-xl overflow-hidden 
            shadow-[0_6px_18px_rgba(255,0,0,0.45)] 
            hover:shadow-[0_10px_25px_rgba(255,0,0,0.6)] 
            active:scale-95 
            transition-all duration-300 ease-out 
            cursor-pointer
          "
        >
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${assets.alert})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MapMock;