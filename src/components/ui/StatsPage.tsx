"use client";

import { useSession } from "next-auth/react";

import { OverlayMode } from "@components/ui/MenuBar";
import StatsPageUser from "@components/ui/StatsPageUser";
import StatsPageAnon from "@components/ui/StatsPageAnon";

type StatsPageProps = {
  setMode: (mode: OverlayMode) => void;
};

const StatsPage = ({ setMode }: StatsPageProps) => {
  const { data: session } = useSession();

  if (session) return <StatsPageUser/>;
  return <StatsPageAnon setMode={setMode} />;
};

export default StatsPage;
