export type MissionTargetType =
  | 'LIKE_GIVEN'
  | 'POST_CREATED'
  | 'MAP_VIEW'
  | 'COMMENT_CREATED';

export interface Mission {
  missionKey: string;
  title: string;
  description: string;
  targetType: MissionTargetType;
  targetCount: number;
  rewardPoint: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MissionCreatePayload {
  missionKey: string;
  title: string;
  description: string;
  targetType: MissionTargetType;
  targetCount: number;
  rewardPoint: number;
  sortOrder: number;
  active: boolean;
}

export interface MissionUpdatePayload {
  title?: string;
  description?: string;
  targetType?: MissionTargetType;
  targetCount?: number;
  rewardPoint?: number;
  sortOrder?: number;
  active?: boolean;
}

export interface MissionStats {
  missionKey: string;
  date: string;
  participantCount: number;
  completedCount: number;
  claimedCount: number;
  claimedRewardSum: number;
}

export const MISSION_TARGET_TYPE_LABELS: Record<MissionTargetType, string> = {
  LIKE_GIVEN: '좋아요 누르기',
  POST_CREATED: '게시글 작성',
  MAP_VIEW: '지도 열람',
  COMMENT_CREATED: '댓글 작성',
};
