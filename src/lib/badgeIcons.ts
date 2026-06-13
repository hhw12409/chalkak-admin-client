import {
  Award,
  BookOpen,
  Cake,
  Calendar,
  Camera,
  Compass,
  Crown,
  Feather,
  FileText,
  Flame,
  Footprints,
  Gem,
  Gift,
  Heart,
  Map,
  MapPin,
  Medal,
  MessageCircle,
  Mountain,
  NotebookPen,
  PartyPopper,
  Pencil,
  PenLine,
  Share2,
  Smile,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Target,
  Tent,
  ThumbsUp,
  Trophy,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * 어드민 picker와 클라이언트 렌더가 공유하는 Lucide 아이콘 카탈로그.
 * 새 키 추가 시 chalkak-client/src/lib/badgeIcons.ts 도 동일하게 업데이트할 것.
 */

export type BadgeIconGroup =
  | "ACHIEVEMENT"
  | "WRITING"
  | "SOCIAL"
  | "EXPLORATION"
  | "SEASON";

export interface BadgeIconDef {
  key: string;
  label: string;
  icon: LucideIcon;
  group: BadgeIconGroup;
}

export const BADGE_ICON_GROUP_LABELS: Record<BadgeIconGroup, string> = {
  ACHIEVEMENT: "성취",
  WRITING: "기록",
  SOCIAL: "소셜",
  EXPLORATION: "탐험",
  SEASON: "시즌/이벤트",
};

export const BADGE_ICON_CATALOG: BadgeIconDef[] = [
  // 성취
  { key: "Trophy", label: "트로피", icon: Trophy, group: "ACHIEVEMENT" },
  { key: "Award", label: "상장", icon: Award, group: "ACHIEVEMENT" },
  { key: "Medal", label: "메달", icon: Medal, group: "ACHIEVEMENT" },
  { key: "Crown", label: "왕관", icon: Crown, group: "ACHIEVEMENT" },
  { key: "Star", label: "별", icon: Star, group: "ACHIEVEMENT" },
  { key: "Sparkles", label: "반짝이", icon: Sparkles, group: "ACHIEVEMENT" },
  { key: "Gem", label: "보석", icon: Gem, group: "ACHIEVEMENT" },
  { key: "Flame", label: "불꽃", icon: Flame, group: "ACHIEVEMENT" },
  { key: "Zap", label: "번개", icon: Zap, group: "ACHIEVEMENT" },
  { key: "Target", label: "타겟", icon: Target, group: "ACHIEVEMENT" },
  // 기록
  { key: "Feather", label: "깃펜", icon: Feather, group: "WRITING" },
  { key: "PenLine", label: "펜", icon: PenLine, group: "WRITING" },
  { key: "Pencil", label: "연필", icon: Pencil, group: "WRITING" },
  { key: "BookOpen", label: "책", icon: BookOpen, group: "WRITING" },
  { key: "FileText", label: "글", icon: FileText, group: "WRITING" },
  { key: "NotebookPen", label: "노트", icon: NotebookPen, group: "WRITING" },
  // 소셜
  { key: "Users", label: "사람들", icon: Users, group: "SOCIAL" },
  { key: "Heart", label: "하트", icon: Heart, group: "SOCIAL" },
  { key: "ThumbsUp", label: "엄지", icon: ThumbsUp, group: "SOCIAL" },
  { key: "MessageCircle", label: "댓글", icon: MessageCircle, group: "SOCIAL" },
  { key: "Share2", label: "공유", icon: Share2, group: "SOCIAL" },
  { key: "UserPlus", label: "팔로우", icon: UserPlus, group: "SOCIAL" },
  { key: "Smile", label: "웃음", icon: Smile, group: "SOCIAL" },
  // 탐험
  { key: "Compass", label: "나침반", icon: Compass, group: "EXPLORATION" },
  { key: "Map", label: "지도", icon: Map, group: "EXPLORATION" },
  { key: "MapPin", label: "핀", icon: MapPin, group: "EXPLORATION" },
  { key: "Camera", label: "카메라", icon: Camera, group: "EXPLORATION" },
  { key: "Mountain", label: "산", icon: Mountain, group: "EXPLORATION" },
  { key: "Tent", label: "텐트", icon: Tent, group: "EXPLORATION" },
  { key: "Footprints", label: "발자국", icon: Footprints, group: "EXPLORATION" },
  // 시즌/이벤트
  { key: "Gift", label: "선물", icon: Gift, group: "SEASON" },
  { key: "PartyPopper", label: "파티", icon: PartyPopper, group: "SEASON" },
  { key: "Cake", label: "케이크", icon: Cake, group: "SEASON" },
  { key: "Snowflake", label: "눈송이", icon: Snowflake, group: "SEASON" },
  { key: "Sun", label: "해", icon: Sun, group: "SEASON" },
  { key: "Calendar", label: "캘린더", icon: Calendar, group: "SEASON" },
];

const ICON_BY_KEY: Record<string, LucideIcon> = Object.fromEntries(
  BADGE_ICON_CATALOG.map((d) => [d.key, d.icon]),
);

export function getLucideIconByKey(key: string | null | undefined): LucideIcon | null {
  if (!key) return null;
  return ICON_BY_KEY[key] ?? null;
}
