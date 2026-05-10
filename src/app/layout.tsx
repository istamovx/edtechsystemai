import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coursue — O'quv markazlari uchun AI platforma",
  description: "Sun'iy intellekt yordamida o'quv markazlari boshqaruvi: imtihonlar, davomat, to'lovlar va hisobotlar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
