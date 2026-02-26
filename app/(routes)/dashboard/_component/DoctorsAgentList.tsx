"use client";

import DoctorAgentCard from "./DoctorAgentCard";
import { AIDoctorAgents } from "../../../shared/list";

function DoctorsAgentList() {
  return (
    <div className="mt-12 max-w-7xl mx-auto px-6">

      <h2 className="text-2xl font-bold mb-8">
        AI Specialist Doctors
      </h2>

     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

        {AIDoctorAgents.map((doctor) => (
          <DoctorAgentCard
            key={doctor.id}
            doctor={doctor}
          />
        ))}

      </div>
    </div>
  );
}

export default DoctorsAgentList;