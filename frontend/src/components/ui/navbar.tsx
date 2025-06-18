"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import { div } from "framer-motion/client";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Book a Call", path: "/book" },
    { name: "Manage Booking", path: "/manage" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white/95 backdrop:blur-sm shadow-lg sticky top-0 z-50 py-2">
      <AnimatePresence>
        <div className="container-max section-padding">
          <div className="flex flex-row items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex flex-row items-center gap-2">
              <Image width={48} height={48} src="/logo.png" alt="Logo" />
              <span className="font-handwritten font-bold text-xl gradient-text">
                Spread Love Network
              </span>
            </Link>

            {/* desktop navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`font-semibold ${
                      pathname === item.path
                        ? "text-brand-end"
                        : "text-gray-800 hover:text-brand-end"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* mobile nav icon */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
                className={`text-gray-700 hover:text-brand-end`}
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* mobile navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              {navItems.map((item) => {
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 font-medium transition-colors duration-200 ${
                      pathname === item.path
                        ? "text-brand-end"
                        : "text-gray-700 hover:text-brand-end"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
