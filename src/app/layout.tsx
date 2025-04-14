import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "@styles/globals.css";

const inconsolata = Inconsolata({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freecell Game",
  description: "A web-based Freecell card game built with React and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inconsolata.className}>{children}</body>
    </html>
  );
}
