import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { PlacementRescue } from "@/components/placement-rescue";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SoundTeacher",
    template: "%s · SoundTeacher",
  },
  description:
    "SoundTeacher — çevrim içi piyano öğretmeni. Yerleştirme, deneme programı ve dinleme geri bildirimi.",
  applicationName: "SoundTeacher",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SoundTeacher",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b6e6a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
        <PlacementRescue />
        <PwaRegister />
      </body>
    </html>
  );
}
