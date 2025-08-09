import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inconsolata } from "next/font/google";
import "@/styles/globals.css";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://freecellwithfriends.com"),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "FreeCell with Friends",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FreeCell with Friends daily challenge preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  authors: [
    {
      name: "Jialin Cai",
      url: "https://jialincai.com",
    },
  ],
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inconsolata.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
