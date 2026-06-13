"use client";
import React from "react";
import { X } from "lucide-react";
import { BADGE_GRADIENT_CATALOG } from "@/lib/badgeGradients";

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
}

export default function BadgeGradientPicker({ value, onChange }: Props) {
  return (
    <div className="rounded border border-stroke p-3 dark:border-strokedark">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {value
            ? "선택 시 카테고리 기본 그라데이션 대신 사용됩니다"
            : "선택하지 않으면 카테고리 기본 그라데이션이 적용됩니다"}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
          >
            <X size={12} /> 선택 해제
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {BADGE_GRADIENT_CATALOG.map((g) => {
          const selected = g.key === value;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => onChange(g.key)}
              title={`${g.label} (${g.key})`}
              className={`flex flex-col items-center gap-1 rounded border p-1.5 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${g.className}`}
                aria-hidden
              />
              <span className="line-clamp-1 text-[10px] leading-none">
                {g.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
