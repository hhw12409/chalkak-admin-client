/**
 * 뱃지 등급 정의. 어드민 picker와 클라이언트 렌더가 공유.
 * 서버 enum (BadgeTier)과 동기되어야 한다.
 */

export type BadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface BadgeTierDef {
  key: BadgeTier;
  label: string;
  /** 외곽 링/광택 효과 Tailwind 클래스 */
  ringClass: string;
}

export const BADGE_TIER_CATALOG: BadgeTierDef[] = [
  {
    key: "BRONZE",
    label: "브론즈",
    ringClass: "ring-2 ring-amber-700/60",
  },
  {
    key: "SILVER",
    label: "실버",
    ringClass: "ring-2 ring-slate-300",
  },
  {
    key: "GOLD",
    label: "골드",
    ringClass: "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/40",
  },
  {
    key: "PLATINUM",
    label: "플래티넘",
    ringClass: "ring-2 ring-cyan-300 shadow-lg shadow-cyan-300/50",
  },
];

const TIER_BY_KEY: Record<string, BadgeTierDef> = Object.fromEntries(
  BADGE_TIER_CATALOG.map((t) => [t.key, t]),
);

export function getTierByKey(key: string | null | undefined): BadgeTierDef | null {
  if (!key) return null;
  return TIER_BY_KEY[key] ?? null;
}
