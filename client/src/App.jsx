import React, { useState } from "react";
import assets from "./assets/assets";
import MapMock from "./components/MapMock";
import ServiceCard from "./components/ServiceCard";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const App = () => {
  const [selectedService, setSelectedService] = useState("Stair-Free Paths");
  const [selectedTitle, setSelectedTitle] = useState("Stair-Free Paths");
  const [selectedImg, setSelectedImg] = useState(assets.stairFreePath);

  const handleSelection = (title, img) => {
    setSelectedImg(img);
    setSelectedTitle(title);
    setSelectedService(title);
  };

  return (
    <div className="w-full min-h-screen bg-[#0F0F0F] text-white px-4 sm:px-6 py-6">

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT GRID */}
      <div className="
        max-w-[1600px] mx-auto mt-8 
        grid grid-cols-1 lg:grid-cols-[380px_1fr] 
        gap-6 transition-all duration-500
      ">

        {/* LEFT — SERVICE CARDS */}
        <div className="
          grid 
          grid-cols-1 sm:grid-cols-2 
          gap-4
        ">
          <ServiceCard title="Accessible Toilets" img={assets.toilet}
            selected={selectedService === "Accessible Toilets"}
            onClick={() => handleSelection("Accessible Toilets", assets.toilet)}
          />

          <ServiceCard title="Hospitals & Clinics" img={assets.medical}
            selected={selectedService === "Hospitals & Clinics"}
            onClick={() =>
              handleSelection("Hospitals & Clinics", assets.medical)
            }
          />

          <ServiceCard title="Repair Shops" img={assets.repairShop}
            selected={selectedService === "Repair Shops"}
            onClick={() => handleSelection("Repair Shops", assets.repairShop)}
          />

          <ServiceCard title="Vendors & Shops" img={assets.shops}
            selected={selectedService === "Vendors & Shops"}
            onClick={() => handleSelection("Vendors & Shops", assets.shops)}
          />

          <ServiceCard title="Police Stations" img={assets.policeStation}
            selected={selectedService === "Police Stations"}
            onClick={() =>
              handleSelection("Police Stations", assets.policeStation)
            }
          />

          <ServiceCard title="NGOs & Support" img={assets.ngo}
            selected={selectedService === "NGOs & Support"}
            onClick={() => handleSelection("NGOs & Support", assets.ngo)}
          />

          <ServiceCard title="Stair-Free Paths" img={assets.stairFreePath}
            selected={selectedService === "Stair-Free Paths"}
            onClick={() =>
              handleSelection("Stair-Free Paths", assets.stairFreePath)
            }
          />
        </div>

        {/* RIGHT — MAP */}
        <MapMock selectedTitle={selectedTitle} selectedImg={selectedImg} />
      </div>

      <Footer />

    </div>
  );
};

export default App;
