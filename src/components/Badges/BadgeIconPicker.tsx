"use client";
import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  BADGE_ICON_CATALOG,
  BADGE_ICON_GROUP_LABELS,
  type BadgeIconGroup,
  type BadgeIconDef,
} from "@/lib/badgeIcons";

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
}

const GROUP_ORDER: BadgeIconGroup[] = [
  "ACHIEVEMENT",
  "WRITING",
  "SOCIAL",
  "EXPLORATION",
  "SEASON",
];

export default function BadgeIconPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BADGE_ICON_CATALOG;
    return BADGE_ICON_CATALOG.filter(
      (d) =>
        d.key.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped: Record<BadgeIconGroup, BadgeIconDef[]> = useMemo(() => {
    const map: Record<BadgeIconGroup, BadgeIconDef[]> = {
      ACHIEVEMENT: [],
      WRITING: [],
      SOCIAL: [],
      EXPLORATION: [],
      SEASON: [],
    };
    filtered.forEach((d) => map[d.group].push(d));
    return map;
  }, [filtered]);

  return (
    <div className="rounded border border-stroke p-3 dark:border-strokedark">
      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="아이콘 검색 (예: 트로피, trophy)"
          className="flex-1 rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 rounded border border-stroke px-3 py-2 text-xs hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
          >
            <X size={14} /> 선택 해제
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {GROUP_ORDER.map((group) => {
          const items = grouped[group];
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-4 last:mb-0">
              <div className="mb-2 text-xs font-semibold text-gray-500">
                {BADGE_ICON_GROUP_LABELS[group]}
              </div>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                {items.map((d) => {
                  const selected = d.key === value;
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => onChange(d.key)}
                      title={`${d.label} (${d.key})`}
                      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded border p-1 transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} />
                      <span className="line-clamp-1 text-[10px] leading-none">
                        {d.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-400">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
