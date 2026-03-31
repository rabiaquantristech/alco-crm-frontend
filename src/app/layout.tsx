import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/app/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALCO CRM",
  description: "ALCO CRM Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-100`}>
        <Providers>
        <Toaster position="top-right" />
        {children}
        </Providers>
      </body>
    </html>
  );
}