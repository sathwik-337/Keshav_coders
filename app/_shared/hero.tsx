"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Hero = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard"); // logged in
    } else {
      router.push("/sign-up"); // not logged in
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6">

      <div className="max-w-4xl text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight opacity-0 animate-slideUp">
          <span className="mr-2">🧠</span>
          Transform Healthcare
          <br />
          with AI Medical Voice
          <br />
          Agents
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed opacity-0 animate-slideUp"
          style={{ animationDelay: "0.3s" }}
        >
          Provide 24/7 intelligent medical support using conversational AI.
          Triage symptoms, book appointments, and deliver empathetic care
          with voice-first automation.
        </p>

        {/* Button */}
        <div
          className="mt-10 opacity-0 animate-slideUp"
          style={{ animationDelay: "0.6s" }}
        >
          <button
            onClick={handleGetStarted}
            className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:scale-105 transition duration-300 shadow-lg"
          >
            Get Started
          </button>
        </div>

      </div>

    </section>
  );
};

export default Hero;