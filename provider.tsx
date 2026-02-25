"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function Provider({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, isLoaded } = useUser();

  // ✅ Create user in DB
  const createNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log("User synced:", result.data);
    } catch (error) {
      console.error("User creation failed:", error);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    createNewUser();
  }, [user, isLoaded]);

  return <div>{children}</div>;
}

export default Provider;