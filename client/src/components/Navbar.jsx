import React, { useEffect, useContext } from "react";
import logo from "../assets/logo.png";
import { SignInButton, UserButton, SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <nav className="w-full bg-[#0F0F0F] border-b border-gray-700 px-6 sm:px-10 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-12 h-12 bg-[#f5f4f6] rounded-lg object-contain" />
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg sm:text-xl leading-tight">
              Wheelchair Guidance & Assistance
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">Navigate with confidence and independence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton
              appearance={{
                elements: { button: "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm shadow transition" }
              }}
            />
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-10 h-10 hover:scale-105 transition-all" }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
