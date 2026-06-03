"use client";
import React from "react";
import { SearchType } from "@/types/admin";

interface Props {
  value: SearchType;
  onChange: (v: SearchType) => void;
}

const TABS: { type: SearchType; label: string }[] = [
  { type: "PHOTO_SPOT", label: "포토스팟" },
  { type: "COMMUNITY", label: "커뮤니티" },
];

export default function PopularKeywordTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded border border-stroke bg-white p-1 dark:border-strokedark dark:bg-boxdark">
      {TABS.map((tab) => {
        const active = tab.type === value;
        return (
          <button
            key={tab.type}
            type="button"
            onClick={() => onChange(tab.type)}
            className={`rounded px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-primary text-white"
                : "text-bodydark hover:bg-gray-1 dark:hover:bg-meta-4"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
