// MapMock.jsx
// Option A: Live Nominatim search + OSRM routing + React-Leaflet integration
// Naming & comments intentionally explicit so your teammates can follow easily.

import React, { useEffect, useState, useRef } from "react";
import assets from "../assets/assets";
import SosAlert from "./SosAlert";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

// react-leaflet + leaflet
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Vite-friendly import of Leaflet marker images (no require)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon paths for modern bundlers (Vite/CRA)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Blue dot for user location
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #1e90ff;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 8px rgba(30,144,255,0.8);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Destination icon using your assets.location
const destinationIcon = L.icon({
  iconUrl: assets.location, // <--- your location asset
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const haversineMeters = (a, b) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const hav = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(hav));
};

/**
 * Recenter component — instructs leaflet map to recenter when `center` changes
 */
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}


const MapMock = ({ selectedTitle, selectedImg }) => {
  const { isSignedIn } = useUser();

  // UI states (kept same naming as your original)
  const [showAlert, setShowAlert] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  // POI & routing states
  const [destination, setDestination] = useState(null); // Nominatim result {lat, lon, display_name, ...}
  const [routeCoords, setRouteCoords] = useState([]); // [[lat,lng], ...] for Polyline

  // Abort controller ref to cancel fetches
  const abortRef = useRef(null);

  // Map center fallback (India center) — change if you want different fallback
  const mapCenter = userLocation.lat ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];

  // Mapping of UI label -> Nominatim query (tweak as needed)
  const serviceQueryMap = {
    "Accessible Toilets": "public toilet",
    "Hospitals & Clinics": "hospital",
    "Repair Shops": "wheelchair repair",
    "Vendors & Shops": "medical supplies",
    "Police Stations": "police",
    "NGOs & Support": "disability NGO",
    "Stair-Free Paths": "footway", // best-effort
  };

// 1) Always fetch the user's current location (when signed in)

  useEffect(() => {
    if (!isSignedIn) {
      // reset when not signed in
      setUserLocation({ lat: null, lng: null });
      setDestination(null);
      setRouteCoords([]);
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser");
      return;
    }

    // getCurrentPosition so we always use the freshest location at the moment user is active
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Allow location access for map features");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [isSignedIn]);

  // 2) When selectedTitle or userLocation changes => find nearest POI (Nominatim) + route (OSRM)
  useEffect(() => {
    if (!userLocation.lat || !userLocation.lng) return;

    // map selectedTitle to a query string
    const query = serviceQueryMap[selectedTitle] || selectedTitle || "hospital";

    // cancel any previous ongoing search
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        // small bounding box around user to prefer nearby results (~5km box)
        const delta = 0.05;
        const left = userLocation.lng - delta;
        const top = userLocation.lat + delta;
        const right = userLocation.lng + delta;
        const bottom = userLocation.lat - delta;

        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(
          query
        )}&bounded=1&viewbox=${left},${top},${right},${bottom}&addressdetails=1`;

        const nomResp = await fetch(nomUrl, { signal: controller.signal, headers: { "Accept-Language": "en" } });
        let nomData = await nomResp.json();

        // fallback to a broader search if bounding returns nothing
        if (!Array.isArray(nomData) || nomData.length === 0) {
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}&addressdetails=1`;
          const fbResp = await fetch(fallbackUrl, { signal: controller.signal });
          nomData = await fbResp.json();
        }

        if (!Array.isArray(nomData) || nomData.length === 0) {
          toast.info(`No nearby "${selectedTitle}" found.`);
          setDestination(null);
          setRouteCoords([]);
          return;
        }

        // compute distance to each result, choose nearest
        const enriched = nomData.map((d) => ({
          ...d,
          lat: Number(d.lat),
          lon: Number(d.lon),
          dist: haversineMeters(userLocation, { lat: Number(d.lat), lng: Number(d.lon) }),
        }));
        enriched.sort((a, b) => a.dist - b.dist);
        const best = enriched[0];

        setDestination(best);

        // fetch route from OSRM (project-osrm public server)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${best.lon},${best.lat}?overview=full&geometries=geojson`;
        const routeResp = await fetch(osrmUrl);
        const routeJson = await routeResp.json();

        if (!routeJson || !routeJson.routes || routeJson.routes.length === 0) {
          setRouteCoords([]);
          return;
        }

        // convert OSRM's [lon, lat] pairs to [lat, lon] for leaflet
        const coords = routeJson.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setRouteCoords(coords);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Search/route error:", err);
        toast.error("Error fetching nearby services or route");
        setDestination(null);
        setRouteCoords([]);
      }
    })();

    return () => {
      try { controller.abort(); } catch (e) {}
      abortRef.current = null;
    };
  }, [selectedTitle, userLocation]);

  // Render
  return (
    <div className="w-full h-[450px] sm:h-[550px] lg:h-[650px] rounded-2xl border border-gray-700 bg-[#111] relative overflow-hidden">
      {/* SOS overlay kept as before */}
      {showAlert && (
        <SosAlert onClose={() => setShowAlert(false)} onSend={() => console.log("SOS sent")} location={userLocation} />
      )}

      {/* Interactive map when we have user location */}
      {userLocation.lat ? (
        <MapContainer center={mapCenter} zoom={14} scrollWheelZoom style={{ height: "100%", width: "100%" , zIndex: 1 }}>
          <Recenter center={mapCenter} />
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* user marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              You are here <br />
              Lat: {userLocation.lat.toFixed(6)} <br />
              Lng: {userLocation.lng.toFixed(6)}
            </Popup>
          </Marker>

          {/* destination marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
              <Popup>
                <div style={{ maxWidth: 220 }}>
                  <strong>{String(destination.display_name).split(",")[0]}</strong>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{destination.display_name}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Distance: {Math.round(destination.dist)} m</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* route polyline */}
          {routeCoords && routeCoords.length > 0 && <Polyline positions={routeCoords} pathOptions={{ color: "dodgerblue", weight: 6, opacity: 0.9 }} />}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Waiting for location... (allow geolocation and sign in)
        </div>
      )}

      {/* Top badge — same as your design, keep it above the map */}
      <div className="absolute top-4 left-4 bg-[#1a1a1a] border border-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 z-[9999]">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
        2 locations nearby
      </div>

      {/* Center pointer — keep above map tiles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9999]">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-gray-500 shadow"></div>
      </div>

      {/* Map Legend — kept UI, above tiles */}
      <div className="absolute bottom-4 left-4 bg-[#1a1a1a] border border-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm flex items-start sm:items-center gap-3 w-[140px] sm:w-auto z-[9999]">
        <div>
          <p className="text-gray-400 font-medium mb-1">Map Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${selectedImg})` }} />
            <span className="text-gray-500">{selectedTitle}</span>
          </div>
        </div>
      </div>

      {/* SOS Button — kept UI but raised z-index so it sits above the map */}
      <div className="absolute bottom-4 right-4 z-[9999]">
        <div
          onClick={() => {
            if (!isSignedIn) {
              toast.warn("Please sign in to send an SOS alert.");
              return;
            }
            setShowAlert(true);
          }}
          className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-[0_6px_18px_rgba(255,0,0,0.45)] hover:shadow-[0_10px_25px_rgba(255,0,0,0.6)] active:scale-95 transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: `url(${assets.alert})` }} />
        </div>
      </div>
    </div>
  );
};

export default MapMock;
