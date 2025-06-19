import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {  return (
    <html lang="en" className={quicksand.className}>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <main className="relative flex-grow">{children}</main>
      </body>
    </html>
  );
}
