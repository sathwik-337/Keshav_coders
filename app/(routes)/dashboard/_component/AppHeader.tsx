"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import React from "react";

const AppHeader = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            <span className="text-lg font-semibold text-gray-800">
              SehatSathi
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>

          {isSignedIn && (
            <>
              <Link href="/history" className="hover:text-black transition">
                History
              </Link>

              <Link href="/pricing" className="hover:text-black transition">
                Pricing
              </Link>

              <Link href="/profile" className="hover:text-black transition">
                Profile
              </Link>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {!isSignedIn ? (
            <Link href="/sign-in">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Login
              </button>
            </Link>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}

        </div>

      </div>
    </header>
  );
};

export default AppHeader;