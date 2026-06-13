export type BadgeCategory = 'WRITING' | 'SOCIAL' | 'EXPLORATION' | 'SEASON';

export type BadgeConditionType =
  | 'POST_COUNT'
  | 'COMMENT_COUNT'
  | 'LIKE_RECEIVED_COUNT'
  | 'FOLLOWER_COUNT'
  | 'ATTENDANCE_TOTAL_COUNT'
  | 'LONGEST_STREAK';

export interface Badge {
  badgeKey: string;
  name: string;
  description: string;
  iconUrl: string | null;
  iconKey: string | null;
  category: BadgeCategory;
  conditionType: BadgeConditionType;
  conditionValue: number;
  sortOrder: number;
  active: boolean;
  hidden: boolean;
  awardedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeCreatePayload {
  badgeKey: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  iconKey?: string | null;
  category: BadgeCategory;
  conditionType: BadgeConditionType;
  conditionValue: number;
  sortOrder: number;
  active: boolean;
  hidden: boolean;
}

export interface BadgeUpdatePayload {
  name?: string;
  description?: string;
  iconUrl?: string | null;
  iconKey?: string | null;
  category?: BadgeCategory;
  conditionType?: BadgeConditionType;
  conditionValue?: number;
  sortOrder?: number;
  active?: boolean;
  hidden?: boolean;
}

export interface DailyAwardCount {
  date: string;
  count: number;
}

export interface BadgeStats {
  badgeKey: string;
  totalAwardedCount: number;
  last7Days: DailyAwardCount[];
}

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  WRITING: '작성',
  SOCIAL: '소셜',
  EXPLORATION: '탐험',
  SEASON: '시즌',
};

export const BADGE_CONDITION_TYPE_LABELS: Record<BadgeConditionType, string> = {
  POST_COUNT: '게시글 수',
  COMMENT_COUNT: '댓글 수',
  LIKE_RECEIVED_COUNT: '받은 좋아요 수',
  FOLLOWER_COUNT: '팔로워 수',
  ATTENDANCE_TOTAL_COUNT: '출석 누계',
  LONGEST_STREAK: '최장 연속 출석',
};

export const BADGE_CATEGORIES: BadgeCategory[] = [
  'WRITING',
  'SOCIAL',
  'EXPLORATION',
  'SEASON',
];

export const BADGE_CONDITION_TYPES: BadgeConditionType[] = [
  'POST_COUNT',
  'COMMENT_COUNT',
  'LIKE_RECEIVED_COUNT',
  'FOLLOWER_COUNT',
  'ATTENDANCE_TOTAL_COUNT',
  'LONGEST_STREAK',
];
