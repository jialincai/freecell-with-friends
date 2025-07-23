"use client";

import { useState, useEffect } from "react";
import { useDailyDeal } from "@components/context/DealContext";
import { formatTime } from "@utils/Function";

const WARNING_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const RELOAD_THRESHOLD_MS = 1;

function getTimeUntilNextUTCDeal(): number {
  const now = new Date();
  const nextUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextUTC.getTime() - now.getTime();
}

const DealCountdown = () => {
  const deal = useDailyDeal();
  const [remainingMs, setRemainingMs] = useState(getTimeUntilNextUTCDeal());

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = getTimeUntilNextUTCDeal();
      if (ms <= RELOAD_THRESHOLD_MS) window.location.reload();
      setRemainingMs(ms);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeColor = remainingMs < WARNING_THRESHOLD_MS ? "text-red" : "text-gray";

  // TODO: break out styles
  return (
    <div className="flex flex-row items-end gap-x-2 font-semibold">
      <span className="">Freecell {deal.id}</span>
      <span className={`text-sm ${timeColor}`}>
        updates in: {formatTime(remainingMs)}
      </span>
    </div>
  );
};

export default DealCountdown;
