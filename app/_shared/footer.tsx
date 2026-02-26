import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              SehatSathi
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Democratizing healthcare access through AI. Providing instant, multilingual medical guidance to everyone, everywhere.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-teal-500 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-teal-500 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-teal-500 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-teal-500 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-teal-400 transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-teal-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-teal-400 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">Disclaimer</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Stay Updated</h4>
            <p className="text-neutral-400 text-sm mb-4">
              Subscribe to our newsletter for the latest health tips and updates.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-teal-500 text-white placeholder:text-neutral-500"
              />
              <button className="w-full bg-teal-500 text-white font-medium py-2.5 rounded-lg hover:bg-teal-600 transition-colors text-sm">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} SehatSathi. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for better health.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
