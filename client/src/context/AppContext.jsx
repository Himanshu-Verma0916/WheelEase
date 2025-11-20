import React, { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isSignedIn, user } = useUser(); // no getToken needed
  const [currentUser, setCurrentUser] = useState(null);

  const syncUserToBackend = async () => {
    if (isSignedIn && user) {
      try {
        const payload = {
          data: {
            id: user.id,
            email_addresses: [{ email_address: user.emailAddresses?.[0]?.emailAddress }],
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.profileImageUrl,
          },
          type: "user.created", // mimic webhook event
        };

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user/webhooks`,
          payload
        );

        setCurrentUser(payload.data);
        console.log("✅ User synced to backend!");
      } catch (err) {
        console.log("❌ Error syncing user:", err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    syncUserToBackend(); // sync automatically when user logs in
  }, [isSignedIn, user]);

  return (
    <AppContext.Provider value={{ currentUser, syncUserToBackend }}>
      {children}
    </AppContext.Provider>
  );
};
