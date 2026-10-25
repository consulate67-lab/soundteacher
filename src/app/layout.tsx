import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const body = Source_Sans_3({
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
    "SoundTeacher (SoungTeacher) — çevrim içi piyano öğretmeni. Abonelik, ders yolu ve dinleme geri bildirimi.",
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
      </body>
    </html>
  );
}
