import React from "react";
import { Stethoscope, Activity, FileText, Globe, Mic, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <Stethoscope className="w-10 h-10 text-teal-500" />,
    title: "AI Doctor Consultation",
    description: "Connect with specialized AI agents (Cardiologist, Pediatrician, etc.) for instant medical guidance.",
  },
  {
    icon: <Mic className="w-10 h-10 text-blue-500" />,
    title: "Voice-First Interface",
    description: "Speak naturally to our AI. No typing required. Seamless voice interaction powered by Vapi.",
  },
  {
    icon: <Globe className="w-10 h-10 text-purple-500" />,
    title: "Multilingual Support",
    description: "Communicate in English or Hindi. Our system automatically detects and switches languages.",
  },
  {
    icon: <Activity className="w-10 h-10 text-red-500" />,
    title: "Symptom Analysis",
    description: "Describe your symptoms, and our intelligent system recommends the best specialist for you.",
  },
  {
    icon: <FileText className="w-10 h-10 text-orange-500" />,
    title: "Instant Medical Reports",
    description: "Get a structured clinical summary, diagnosis, and medical advice immediately after your session.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-green-500" />,
    title: "Secure & Private",
    description: "Your health data is processed securely. We prioritize your privacy and data protection.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SehatSathi?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
          Advanced healthcare technology designed to make medical assistance accessible, accurate, and instant for everyone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 text-left"
            >
              <div className="mb-6 p-4 bg-white rounded-xl inline-block shadow-sm border border-gray-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
