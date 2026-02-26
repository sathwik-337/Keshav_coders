import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "./_shared/hero";
import Navbar from "./_shared/navbar";
import Features from "./_shared/features";
import About from "./_shared/about";
import Contact from "./_shared/contact";
import Footer from "./_shared/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Contact />
      <Footer />
    </>
  );
}
