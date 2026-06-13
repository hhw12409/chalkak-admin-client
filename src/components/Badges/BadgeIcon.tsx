"use client";
import React, { useState } from "react";
import { Award, Compass, Feather, Sparkles, Users, type LucideIcon } from "lucide-react";
import { BadgeCategory } from "@/types/badge";
import { getLucideIconByKey } from "@/lib/badgeIcons";
import { getGradientByKey } from "@/lib/badgeGradients";
import { getTierByKey } from "@/lib/badgeTiers";

type Size = "sm" | "md" | "lg";

interface Props {
  name: string;
  iconUrl?: string | null;
  iconKey?: string | null;
  gradientKey?: string | null;
  tier?: string | null;
  category?: BadgeCategory;
  size?: Size;
}

const SIZE_CLASS: Record<Size, { box: string; icon: number }> = {
  sm: { box: "h-10 w-10", icon: 20 },
  md: { box: "h-14 w-14", icon: 28 },
  lg: { box: "h-20 w-20", icon: 40 },
};

const CATEGORY_ICON: Record<BadgeCategory, LucideIcon> = {
  WRITING: Feather,
  SOCIAL: Users,
  EXPLORATION: Compass,
  SEASON: Sparkles,
};

const CATEGORY_GRADIENT: Record<BadgeCategory, string> = {
  WRITING: "from-amber-400 to-orange-500",
  SOCIAL: "from-sky-400 to-indigo-500",
  EXPLORATION: "from-emerald-400 to-teal-600",
  SEASON: "from-fuchsia-400 to-rose-500",
};

const FALLBACK_GRADIENT = "from-gray-400 to-gray-600";

export default function BadgeIcon({
  name,
  iconUrl,
  iconKey,
  gradientKey,
  tier,
  category,
  size = "md",
}: Props) {
  const { box, icon: iconSize } = SIZE_CLASS[size];
  const [imageBroken, setImageBroken] = useState(false);
  const tierRing = getTierByKey(tier)?.ringClass ?? "";

  // 1순위: iconUrl (실제 이미지)
  if (iconUrl && !imageBroken) {
    return (
      <div
        className={`${box} overflow-hidden rounded-full bg-gray-2 dark:bg-meta-4 ${tierRing}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageBroken(true)}
        />
      </div>
    );
  }

  // 그라데이션: gradientKey > 카테고리 기본 > fallback
  const gradient =
    getGradientByKey(gradientKey) ??
    (category ? CATEGORY_GRADIENT[category] : FALLBACK_GRADIENT);

  // 2순위: iconKey (어드민이 고른 Lucide 아이콘)
  const KeyedIcon = getLucideIconByKey(iconKey);
  if (KeyedIcon) {
    return (
      <div
        className={`${box} flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${tierRing}`}
        aria-hidden
      >
        <KeyedIcon size={iconSize} className="text-white" strokeWidth={2.25} />
      </div>
    );
  }

  // 3순위: 카테고리 기본
  const Icon = category ? CATEGORY_ICON[category] : Award;
  return (
    <div
      className={`${box} flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${tierRing}`}
      aria-hidden
    >
      <Icon size={iconSize} className="text-white" strokeWidth={2.25} />
    </div>
  );
}
