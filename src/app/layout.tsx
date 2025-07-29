import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inconsolata } from "next/font/google";
import "@styles/globals.css";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Freecell Game",
  description: "A web-based Freecell card game built with React and Next.js",
};

type LayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inconsolata.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
