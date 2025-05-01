import type { Metadata } from "next"; 
import Providers from "@/contexts/providers";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
 
export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Pathonaut" />

      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
