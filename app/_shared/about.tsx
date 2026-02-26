import React from "react";
import Image from "next/image";

const About = () => {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Bridging the Gap Between <span className="text-teal-600">Patients</span> and <span className="text-blue-600">Healthcare</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            SehatSathi is born from a vision to democratize healthcare access. We believe that quality medical guidance should not be limited by location, language, or availability.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            By leveraging cutting-edge Artificial Intelligence and Voice Technologies, we provide a platform where anyone, anywhere can get instant, reliable medical advice in their native language. Our AI doctors are available 24/7 to listen, analyze, and guide you towards better health.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-teal-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500 font-medium">Availability</div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
              <div className="text-sm text-gray-500 font-medium">AI Powered</div>
            </div>
          </div>
        </div>

        {/* Image/Visual */}
        <div className="flex-1 relative">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
             {/* Placeholder for an image - using a div for now or you can add a real image path */}
             <div className="w-full h-[400px] bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                <span className="text-teal-800/50 font-bold text-2xl">Mission Visual</span>
             </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

      </div>
    </section>
  );
};

export default About;
