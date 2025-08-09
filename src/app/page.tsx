import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Freecell with Friends - Daily Freecell Solitaire Game",
  description:
    "Play FreeCell solitaire online with a new puzzle everyday, stat tracking, and shareable results.",
};

export default function HomePage() {
  return (
    <>
      <header>
        <h1 className="sr-only">
          Freecell with Friends - Daily Freecell Solitaire Game
        </h1>
        <p className="sr-only">
          Play FreeCell solitaire online with a new puzzle everyday, stat
          tracking, and shareable results.
        </p>
      </header>
      <HomeClient />
    </>
  );
}
