import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "KakaoChan Commissions",
  description: "Commission your favorite vamp-wolf VTuber",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-primary)] text-white">
        <Navbar />
        <div className="pt-16">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
