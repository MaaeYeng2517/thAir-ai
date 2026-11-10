import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIverse Directory — AI Agents, Models, Tools & IDEs",
  description: "ค้นหาและเปรียบเทียบ AI Agent, AI Model, AI Tool และ AI IDE ในที่เดียว สร้างด้วย Next.js พร้อม deploy บน Vercel",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "AIverse Directory",
    description: "Directory รวม AI Agents, Models, Tools และ IDEs",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geist.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
