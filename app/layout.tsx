import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Import the Footer
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="pt-12 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main> {/* Ensures the main content takes available space */}
        <Footer /> {/* Add the Footer here */}
      </body>
    </html>
  );
}
