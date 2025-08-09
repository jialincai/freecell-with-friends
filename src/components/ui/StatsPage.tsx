"use client";

import { useSession } from "next-auth/react";
import StatsPageUser from "@/components/ui/StatsPageUser";
import StatsPageAnon from "@/components/ui/StatsPageAnon";

const StatsPage = () => {
  const { data: session } = useSession();
  return session ? <StatsPageUser /> : <StatsPageAnon />;
};

export default StatsPage;
