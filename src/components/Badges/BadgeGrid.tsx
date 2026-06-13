"use client";
import React from "react";
import Link from "next/link";
import {
  BADGE_CATEGORY_LABELS,
  BADGE_CONDITION_TYPE_LABELS,
  Badge,
} from "@/types/badge";
import BadgeIcon from "./BadgeIcon";

interface Props {
  badges: Badge[];
  onEdit: (badge: Badge) => void;
  onDeactivate: (badge: Badge) => void;
  onReactivate: (badge: Badge) => void;
}

export default function BadgeGrid({
  badges,
  onEdit,
  onDeactivate,
  onReactivate,
}: Props) {
  if (badges.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">등록된 뱃지가 없습니다</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.badgeKey}
          className={`flex flex-col rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark ${
            b.active ? "" : "opacity-60"
          }`}
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="shrink-0">
              <BadgeIcon
                name={b.name}
                iconUrl={b.iconUrl}
                category={b.category}
                size="md"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/badges/${encodeURIComponent(b.badgeKey)}`}
                className="block truncate font-semibold text-black hover:text-primary dark:text-white"
                title={b.name}
              >
                {b.name}
              </Link>
              <div className="truncate font-mono text-xs text-gray-500">
                {b.badgeKey}
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {BADGE_CATEGORY_LABELS[b.category]}
            </span>
            {b.active ? (
              <span className="inline-block rounded bg-success/10 px-2 py-0.5 text-xs text-success">
                활성
              </span>
            ) : (
              <span className="inline-block rounded bg-gray-2 px-2 py-0.5 text-xs text-gray-500 dark:bg-meta-4">
                비활성
              </span>
            )}
            {b.hidden && (
              <span className="inline-block rounded bg-warning/10 px-2 py-0.5 text-xs text-warning">
                숨김
              </span>
            )}
          </div>

          <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-xs text-body dark:text-bodydark">
            {b.description}
          </p>

          <div className="mb-3 text-xs text-gray-500">
            조건: {BADGE_CONDITION_TYPE_LABELS[b.conditionType]} ≥{" "}
            {b.conditionValue.toLocaleString()}
          </div>

          <div className="mb-4 text-xs text-gray-500">
            누적 발급:{" "}
            <span className="font-semibold text-black dark:text-white">
              {b.awardedCount.toLocaleString()}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap gap-1">
            <Link
              href={`/badges/${encodeURIComponent(b.badgeKey)}`}
              className="rounded bg-meta-3 px-2 py-1 text-xs text-white hover:bg-opacity-90"
            >
              상세
            </Link>
            <button
              onClick={() => onEdit(b)}
              className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
            >
              편집
            </button>
            {b.active ? (
              <button
                onClick={() => onDeactivate(b)}
                className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
              >
                비활성
              </button>
            ) : (
              <button
                onClick={() => onReactivate(b)}
                className="rounded bg-success px-2 py-1 text-xs text-white hover:bg-opacity-90"
              >
                재활성
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
