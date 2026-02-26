import Image from "next/image";

const DoctorAgentCard = ({ doctor }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">

      {/* Doctor Image */}
      <div className="relative w-full h-64">
        <Image
          src={doctor.image}
          
          alt={doctor.specialization || "Doctor image"}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5">

        <h3 className="font-semibold text-lg mb-2">
          {doctor.specialization}
        </h3>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {doctor.description}
        </p>

        <button className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-black transition">
          Start Consultation
        </button>

      </div>
    </div>
  );
};

export default DoctorAgentCard;