import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inconsolata } from "next/font/google";
import "@/styles/globals.css";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Play FreeCell Solitaire Online - Daily Free Puzzle Game",
  description:
    "Play FreeCell solitaire online free. Enjoy a daily puzzle, track stats, and compete with friends.",
  keywords: [
    "FreeCell",
    "FreeCell solitaire",
    "FreeCell online",
    "Play FreeCell",
    "FreeCell card game",
    "Daily FreeCell",
    "Solitaire",
    "Solitaire game",
    "Play solitaire online",
    "Solitaire card game",
    "Daily solitaire puzzle",
  ],
  metadataBase: new URL("https://freecellwithfriends.com"),
  openGraph: {
    title: "Play FreeCell Solitaire Online - Daily Free Puzzle Game",
    description:
      "Play FreeCell solitaire online free. Enjoy a daily puzzle, track stats, and compete with friends.",
    url: "https://freecellwithfriends.com",
    siteName: "FreeCell with Friends",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FreeCell with Friends daily challenge preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play FreeCell Solitaire Online - Daily Free Puzzle Game",
    description:
      "Play FreeCell solitaire online free. Enjoy a daily puzzle, track stats, and compete with friends.",
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

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://freecellwithfriends.com" />
      </head>
      <body className={inconsolata.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
