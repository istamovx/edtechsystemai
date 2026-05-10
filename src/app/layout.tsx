import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Edtech System AI — O'quv markazlari uchun AI platforma",
  description: "Sun'iy intellekt yordamida o'quv markazlari boshqaruvi: imtihonlar, davomat, to'lovlar va hisobotlar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
