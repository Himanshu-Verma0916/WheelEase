// import React, { createContext } from "react";
// import { useAuth } from "@clerk/clerk-react";

// export const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const { getToken } = useAuth();

//   const sendSOS = async () => {
//     try {
//       const token = await getToken();

//       if (!token) {
//         console.error("No token found from Clerk");
//         return;
//       }

//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/sos`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       console.log("SOS Response:", data);
//     } catch (error) {
//       console.error("Error sending SOS:", error);
//     }
//   };

//   return (
//     <AppContext.Provider value={{ sendSOS }}>
//       {children}
//     </AppContext.Provider>
//   );
// };
