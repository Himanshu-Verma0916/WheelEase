import React, { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

// Create context
export const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const { isSignedIn, user, getToken } = useUser();
  const [currentUser, setCurrentUser] = useState(null);

  const syncUserToBackend = async () => {
    if (isSignedIn && user) {
      try {
        const token = await getToken({ template: "default" });

        const payload = {
          data: {
            id: user.id,
            email_addresses: [{ email_address: user.emailAddresses?.[0]?.emailAddress }],
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.profileImageUrl,
          },
          type: "user.created",
        };

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user/webhooks`,
          payload,
          { headers: { token } }
        );

        setCurrentUser(payload.data);
        console.log("✅ User synced to backend!");
      } catch (err) {
        console.log("❌ Error syncing user:", err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    syncUserToBackend();
  }, [isSignedIn, user]);

  return (
    <AppContext.Provider value={{ currentUser, syncUserToBackend }}>
      {children}
    </AppContext.Provider>
  );
};
