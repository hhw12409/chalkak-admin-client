"use client";
import React from "react";
import { X } from "lucide-react";
import { BADGE_TIER_CATALOG, type BadgeTier } from "@/lib/badgeTiers";

interface Props {
  value: BadgeTier | null;
  onChange: (key: BadgeTier | null) => void;
}

export default function BadgeTierPicker({ value, onChange }: Props) {
  return (
    <div className="rounded border border-stroke p-3 dark:border-strokedark">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          등급을 지정하면 뱃지 외곽에 링/광택 효과가 추가됩니다
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
          >
            <X size={12} /> 등급 해제
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BADGE_TIER_CATALOG.map((t) => {
          const selected = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex flex-col items-center gap-1.5 rounded border p-2 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 ${t.ringClass}`}
                aria-hidden
              />
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
