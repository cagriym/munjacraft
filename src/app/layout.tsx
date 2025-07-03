import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import FloatingContactBubble from "@/components/FloatingContactBubble";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MunjaCraft",
  description: "Türkiye'nin en kaliteli Minecraft sunucusu!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-100 min-h-screen"}>
        <Providers>
          <Navbar />
          <Toaster position="bottom-center" richColors />
          <div className="pt-20 px-0 md:px-0 lg:px-0">{children}</div>
          <FloatingContactBubble />
        </Providers>
      </body>
    </html>
  );
}
