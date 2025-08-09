import type { Metadata } from "next";
import HelpPage from "@/components/ui/HelpPage";

export const metadata: Metadata = {
  title: "How to Play FreeCell",
  description: "Learn how to play FreeCell solitaire.",
  metadataBase: new URL("https://freecellwithfriends.com"),
  alternates: { canonical: "/help" },
};

export default function Help() {
  return <HelpPage/>;
}