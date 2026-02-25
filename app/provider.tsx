"use client";

import React, { useEffect,useState} from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";





export type UsersDetails={
  name:string,
  email:string,
  credits:number
}




function Provider({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, isLoaded } = useUser();
  const [userDetails,setUserDetails]=useState<any>();

  // ✅ Create user in DB
  const createNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log("User synced:", result.data);
      setUserDetails(result.data);
    } catch (error) {
      console.error("User creation failed:", error);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    createNewUser();
  }, [user, isLoaded]);

  return(
   <div>
    <UserDetailContext.Provider value={{userDetails,setUserDetails}}>

    {children}
    </UserDetailContext.Provider>
    </div>);
}

export default Provider;