"use client";
import React, { useState } from "react";
import SpotRankingPanel from "@/components/Rankings/SpotRankingPanel";
import MetricsPanel from "@/components/Rankings/MetricsPanel";

type TabKey = "service" | "metrics";

const TABS: { key: TabKey; label: string }[] = [
  { key: "service", label: "랭킹 관리" },
  { key: "metrics", label: "지표 분석" },
];

export default function RankingClient() {
  const [tab, setTab] = useState<TabKey>("service");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          랭킹 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          탭1은 실제 사용자에게 노출되는 랭킹입니다. 탭2는 분석용 지표입니다.
        </p>
      </div>

      <div className="flex gap-2 border-b border-stroke dark:border-strokedark">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "service" ? <SpotRankingPanel /> : <MetricsPanel />}
      </div>
    </div>
  );
}
