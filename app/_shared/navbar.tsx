"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[#f5f7fb]/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="text-2xl font-bold tracking-tight text-gray-900 cursor-pointer">
         <img src="/logo.jpeg" alt="logo" width={100} />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          {["Home", "Features", "About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={item === "Home" ? "/" : `#${item.toLowerCase()}`} 
              className="relative group cursor-pointer"
            >
              {item}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Desktop Right Buttons */}
        <div className="hidden md:flex items-center gap-4">
         

          {!user ? (
             <Link href="/sign-in">
            <button className="text-gray-700 font-medium hover:text-black transition">
              Login
            </button>
            </Link>
            
          ) : (
            <>
              <UserButton afterSignOutUrl="/" />

              {/* ✅ Dashboard only when logged in */}
              <Link href="/dashboard">
              <button className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:scale-105 transition duration-300 shadow-md">
                Dashboard
              </button>
              </Link>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-5 text-gray-700">

          {["Home", "Features", "About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
              className="block text-lg"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}

          {!user ? (
            <button className="w-full border border-gray-300 py-2 rounded-lg">
              Login
            </button>
          ) : (
            <>
              <div className="flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>

              {/* ✅ Dashboard only when logged in */}
              <button className="w-full bg-black text-white py-2 rounded-lg">
                Dashboard
              </button>
            </>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;