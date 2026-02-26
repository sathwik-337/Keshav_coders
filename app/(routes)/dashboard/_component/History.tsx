"use client";

import React, { useState } from "react";
import Link from "next/link";
import AddNewSession from "./AddNewSession";

const DashboardPage = () => {
  // No API call — initial state empty
  const [history] = useState<any[]>([]);

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Dashboard</h1>

       
      </div>

      {/* CONDITION */}
      {history.length === 0 ? (
        // EMPTY STATE
        <div className="border border-dashed border-gray-300 rounded-2xl p-16 text-center bg-gray-50">

          <div className="flex justify-center mb-6">
            <img
              src="/doctoranimated.png"
              alt="No consultations"
              className="w-40"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            No Recent Consultations
          </h2>

          <p className="text-gray-500 mb-6">
            It looks like you haven’t consulted with any doctors yet.
          </p>
          <AddNewSession/>
          {/* <Link href="/consult">
           
          </Link> */}

        </div>
      ) : (
        // DASHBOARD WITH HISTORY
        <div className="grid md:grid-cols-2 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {item.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>

                <Link href={`/consult/${item.id}`}>
                  <button className="text-black font-medium hover:underline">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
