export type AdminRole = 'VIEWER' | 'OPERATOR' | 'ADMIN';
export type UnmaskTargetType = 'USER' | 'ADMIN_USER' | 'AUDIT_LOG';
export type SanctionLevel = 'WARNING' | 'SUSPEND_7D' | 'SUSPEND_30D' | 'PERMANENT';
export type SanctionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type ReportAction = 'HIDE_CONTENT' | 'DELETE_CONTENT' | 'REJECT_REPORT' | 'WARN_USER';

export interface AdminInfo {
  adminId: number;
  username: string;
  name: string;
  role: AdminRole;
}

export interface LoginResponse {
  accessToken: string;
  admin: AdminInfo;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
  newUsersToday: number;
  totalArticles: number;
  activeArticles: number;
  hiddenArticles: number;
  deletedArticles: number;
  newArticlesToday: number;
  totalReports: number;
  totalInquiries: number;
  pendingInquiries: number;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface DashboardTrend {
  userTrend: DailyCount[];
  articleTrend: DailyCount[];
}

export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  emailMasked: boolean;
  nickname: string;
  phoneNumber?: string;
  phoneNumberMasked: boolean;
  profileImage?: string;
  introduction?: string;
  snsType?: string;
  role: string;
  status: string;
  isPrivate: boolean;
  userUuid: string;
  termsAgreedAt?: string;
  privacyAgreedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSanction {
  sanctionId: number;
  userId: number;
  adminId: number;
  adminUsername: string;
  level: SanctionLevel;
  status: SanctionStatus;
  reason: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminArticle {
  articleId: number;
  articleTypeId: number;
  userId: number;
  authorNickname?: string;
  authorEmail?: string;
  title: string;
  content: string;
  readCount: number | null;
  likeCount: number | null;
  actualLikeCount?: number;  // 실제 like 테이블 카운트 (없으면 likeCount 폴백)
  commentCount?: number;     // 댓글 수
  location?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  status: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export interface TargetPreview {
  contentPreview: string;
  authorUserId: number;
}

export interface ReportGroup {
  targetType: string;
  targetId: number;
  reportCount: number;
  unprocessedCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  topReason: string;
  targetPreview: TargetPreview;
  isProcessed: boolean;
  resolvedAction?: string;
  resolveReason?: string;
  processedAt?: string;
}

export interface ReportDetail {
  reportId: number;
  reporterUserId: number;
  reason: string;
  description?: string;
  reportedAt: string;
  processedAt?: string;
  resolvedAction?: string;
  resolveReason?: string;
}

export interface AdminInquiry {
  inquiryId: number;
  userId: number;
  category: string;
  inquiryTitle: string;
  inquiryContent: string;
  inquiryImages?: string;
  status: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  bannerId: number;
  bannerTypeId: number;
  bannerUrl: string;
  startedAt: string;
  endedAt: string;
  impressionCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerPayload {
  bannerTypeId: number;
  bannerUrl: string;
  startedAt: string;
  endedAt: string;
}

export type AuditResult = 'SUCCESS' | 'FAILURE';

export interface AuditLog {
  auditId: number;
  adminId: number;
  adminUsername: string;
  action: string;
  targetType?: string;
  targetId?: number;
  reason?: string;
  metadata?: string;
  requestIp?: string;
  requestIpMasked: boolean;
  result: AuditResult;
  errorMessage?: string;
  createdAt: string;
}

export type SearchType = 'PHOTO_SPOT' | 'COMMUNITY';

export interface PopularKeyword {
  popularKeywordId: number;
  keyword: string;
  rank: number;
  rankChange: number;
  isNew: boolean;
  searchType: SearchType;
  searchCount: number | null;
}

export interface PopularKeywordUpdatePayload {
  keyword?: string;
  rank?: number;
}

export interface PopularKeywordDeletePayload {
  reason?: string;
}

export interface SearchKeyword {
  searchKeywordId: number;
  searchKeyword: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}


export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface AdminUserAccount {
  adminId: number;
  username: string;
  name: string;
  email: string;
  emailMasked: boolean;
  role: AdminRole;
  status: AdminUserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginIpMasked: boolean;
  createdAt: string;
}

export interface AdminComment {
  articleCommentId: number;
  articleId: number;
  userId: number;
  comment: string;
  status: string;
  isHidden: boolean;
  parentCommentId?: number;
  createdAt: string;
  reportCount?: number;
}

export interface AdminArticleComment {
  articleCommentId: number;
  articleId: number;
  userId: number;
  comment: string;
  status: string;
  isHidden: boolean;
  parentCommentId: number | null;
  authorNickname: string | null;
  authorUsername: string | null;
  createdAt: string;
}

export interface AdminCommentDetail extends AdminComment {
  articleTitle?: string;
  authorNickname?: string;
  authorEmail?: string;
  updatedAt?: string;
  reportCount: number;
}

export type SpotRankingPeriod = 'ALL_TIME' | 'WEEKLY' | 'MONTHLY';

export interface SpotRanking {
  rank: number;
  locationName: string | null;
  latitude: number;
  longitude: number;
  articleCount: number;
  totalLikes: number;
  thumbnailUrl: string | null;
}

export type NoticeCategory = 'SERVICE' | 'UPDATE' | 'EVENT' | 'NOTICE';

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  category: NoticeCategory;
  categoryLabel: string;
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeCreatePayload {
  title: string;
  content: string;
  category: NoticeCategory;
  isActive?: boolean;
  isPinned?: boolean;
}

export type NoticeUpdatePayload = Partial<NoticeCreatePayload>;

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';

export interface AdminEvent {
  eventId: number;
  title: string;
  description: string | null;
  bannerImageUrl: string | null;
  eventStatus: EventStatus;
  eventStatusLabel: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  prizes: string | null;
  rules: string | null;
  cautions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreatePayload {
  title: string;
  description?: string | null;
  bannerImageUrl?: string | null;
  eventStatus: EventStatus;
  startDate: string;
  endDate: string;
  participantCount?: number;
  prizes?: string | null;
  rules?: string | null;
  cautions?: string | null;
  isActive?: boolean;
}

export type EventUpdatePayload = Partial<EventCreatePayload>;

export interface PagedResponseDto<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrev: boolean;
}
