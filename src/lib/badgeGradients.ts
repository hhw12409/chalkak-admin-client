/**
 * 어드민 picker와 클라이언트 렌더가 공유하는 뱃지 그라데이션 팔레트.
 * 새 키 추가 시 chalkak-client/src/lib/badgeGradients.ts 도 동일 갱신.
 */

export interface BadgeGradientDef {
  key: string;
  label: string;
  /** Tailwind from-* to-* 클래스 쌍 */
  className: string;
}

export const BADGE_GRADIENT_CATALOG: BadgeGradientDef[] = [
  { key: "sunset", label: "선셋", className: "from-orange-400 to-pink-500" },
  { key: "ocean", label: "오션", className: "from-cyan-400 to-blue-600" },
  { key: "forest", label: "포레스트", className: "from-green-400 to-emerald-700" },
  { key: "lavender", label: "라벤더", className: "from-purple-400 to-pink-500" },
  { key: "fire", label: "파이어", className: "from-red-500 to-orange-500" },
  { key: "mint", label: "민트", className: "from-teal-300 to-emerald-500" },
  { key: "gold", label: "골드", className: "from-yellow-400 to-amber-600" },
  { key: "silver", label: "실버", className: "from-gray-300 to-slate-500" },
  { key: "bronze", label: "브론즈", className: "from-amber-700 to-orange-900" },
  { key: "rose-gold", label: "로즈골드", className: "from-pink-300 to-rose-500" },
  { key: "midnight", label: "미드나잇", className: "from-indigo-600 to-purple-900" },
  { key: "aurora", label: "오로라", className: "from-emerald-400 to-sky-500" },
  { key: "monochrome", label: "모노", className: "from-gray-500 to-gray-800" },
  { key: "cherry", label: "체리", className: "from-rose-400 to-red-600" },
];

const GRADIENT_BY_KEY: Record<string, string> = Object.fromEntries(
  BADGE_GRADIENT_CATALOG.map((g) => [g.key, g.className]),
);

export function getGradientByKey(key: string | null | undefined): string | null {
  if (!key) return null;
  return GRADIENT_BY_KEY[key] ?? null;
}
