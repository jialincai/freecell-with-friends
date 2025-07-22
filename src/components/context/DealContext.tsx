"use client";

import { Deal } from "@lib/db/deals";
import React, { createContext, useContext } from "react";

const DealContext = createContext<Deal | null>(null);
export const useDailyDeal = () => {
  const context = useContext(DealContext);
  if (!context)
    throw new Error("useDailyDeal must be used inside a DealProvider");
  return context;
};

export const DealProvider = ({
  deal,
  children,
}: {
  deal: Deal;
  children: React.ReactNode;
}) => {
  return <DealContext.Provider value={deal}>{children}</DealContext.Provider>;
};
