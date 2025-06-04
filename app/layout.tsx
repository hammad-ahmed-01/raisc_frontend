import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <main className="relative flex-grow">{children}</main>
      </body>
    </html>
  );
}
