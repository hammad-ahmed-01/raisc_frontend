import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-blue-600 text-white py-8 mt-2">
            <div className="container mx-auto px-6 md:flex md:justify-between md:items-center">
                {/* Logo & Brand Info */}
                <div className="mb-6 md:mb-0 text-center md:text-left">
                    <div className="flex justify-center md:justify-start items-center space-x-3">
                    <div className="bg-white rounded-full p-1 w-fit">
                      <Image
                        src="/raisc-logo.png"
                        alt="RAISC Logo"
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    </div>
                        
                        <h1 className="text-2xl font-semibold tracking-wide">RAISC</h1>
                    </div>
                    <p className="text-gray-200 mt-2">Revolutionizing Mental Health through AI</p>
                </div>

                {/* Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-semibold">Company</h3>
                        <ul className="mt-2 space-y-2">
                            <li><Link href="/about" className="hover:text-gray-300 transition">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-gray-300 transition">Contact</Link></li>
                            <li><Link href="/careers" className="hover:text-gray-300 transition">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Support</h3>
                        <ul className="mt-2 space-y-2">
                            <li><Link href="/faq" className="hover:text-gray-300 transition">FAQ</Link></li>
                            <li><Link href="/help" className="hover:text-gray-300 transition">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-gray-300 transition">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Follow Us</h3>
                        <ul className="mt-2 space-y-2">
                            <li><a href="#" className="hover:text-gray-300 transition">Facebook</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition">Twitter</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center text-gray-200 text-sm">
                © {new Date().getFullYear()} RAISC. All Rights Reserved.
            </div>
        </footer>
    );
}
