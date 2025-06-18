import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { li } from "framer-motion/client";

function Footer() {
  const navItems = [
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Book a Call", path: "/book" },
    { name: "Manage Booking", path: "/manage" },
  ];

  return (
    <footer className=" bg-gray-900 text-white">
      <div className="container-max section-padding py-12 ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className=" col-span-1 md:col-span-2">
            <Link href="/" className="flex flex-row items-center gap-2 mb-4">
              <Image width={48} height={48} src="/logo.png" alt="Logo" />
              <span className="font-handwritten font-semibold text-xl -text">
                Spread Love Network
              </span>
            </Link>

            <p className="text-gray-300 mb-6 max-w-md">
              Making special moments even more memorable with personalized
              surprise calls. Spread love, create smiles, and connect hearts
              across the world.
            </p>

            <div className="flex flex-row gap-4">
              <Link
                href={"/"}
                className="text-gray-300 hover:text-brand-end transition-colors"
              >
           
                <Facebook />
              </Link>
              <Link
                href={"/"}
                className="text-gray-300 hover:text-brand-end transition-colors"
              >
               
                <Instagram />
              </Link>
              <Link
                href={"/"}
                className="text-gray-300 hover:text-brand-end transition-colors"
              >
                
                <Twitter />
              </Link>
            </div>
          </div>
          <div className="col-span-1">
            <h1 className="font-bold text-xl mb-4">Quick Links</h1>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>

                  <Link
                    key={item.name}
                    href={item.path}
                    className="hover:text-brand-end"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h1 className="font-bold text-xl mb-4">Contact Us</h1>
            <ul className="space-y-2">
              <li key="1" className="space-x-2">
                <Phone className="h-6 w-6 text-brand-end inline" />
                <h1 className="inline">+234 905 815 0728</h1>
              </li>

              <li key="2" className="space-x-2">
                <Mail className="h-6 w-6 text-brand-end inline" />
                <h1 className="inline">spreadlovenetwork@gmail.com</h1>
              </li>

              <li key="3" className="space-x-2">
                <MapPin className="h-6 w-6 text-brand-end inline" />
                <h1 className="inline">Imo, Nigeria</h1>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 text-center mt-8 pt-8">
          <p className="text-gray-300 font-semibold">
            © 2024 Spread Love. All rights reserved. Made with ❤️ for spreading
            joy.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
