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
  /**
   * 어드민이 관리하는 직책 마스터 FK.
   * @deprecated `title` (자유 텍스트) 는 폐기됨. 마스터 ID/라벨 사용.
   */
  title?: string | null;
  /** 어드민이 관리하는 직책 마스터(user_title_tb) FK. null이면 미설정. */
  titleId?: number | null;
  /** 직책 마스터의 라벨(예: 포토그래퍼). 서버가 fetch join으로 조립. */
  titleLabel?: string | null;
  termsAgreedAt?: string;
  privacyAgreedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 사용자에게 직책 마스터 부여/해제 요청 본문. */
export interface UserTitleAssignPayload {
  titleId: number | null;
}

/** 어드민이 관리하는 직책 마스터(user_title_tb) 한 행. */
export interface UserTitle {
  id: number;
  label: string;
  displayOrder: number;
  isActive: boolean;
  status: 'ACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string | null;
}

export interface UserTitleCreatePayload {
  label: string;
  /** null/생략 시 서버가 max+1 자동 할당. */
  displayOrder?: number | null;
  isActive?: boolean;
}

export interface UserTitleUpdatePayload {
  label?: string;
  displayOrder?: number;
  isActive?: boolean;
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
  /** article_type_tb.article_type 라벨 (예: "포토스팟", "커뮤니티"). 마스터에 없으면 null. */
  articleType?: string | null;
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

// ─── 회원 강제 탈퇴 / 강제 로그아웃 ──────────────────────────────────────────
/** POST /users/{userId}/force-withdrawal body */
export interface ForceWithdrawalPayload {
  reason: string;
  /** 서버측 닉네임 이중확인. 현재 회원의 닉네임과 정확히 일치해야 함. */
  confirmNickname: string;
}

/** POST /users/{userId}/force-logout body */
export interface ForceLogoutPayload {
  reason: string;
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
  authorNickname?: string | null;
  authorUsername?: string | null;
  /** 댓글이 달린 게시글 제목. 고아 댓글이면 null. */
  articleTitle?: string | null;
  /** article_tb.article_type_id. 게시글 row가 없으면 null. */
  articleTypeId?: number | null;
  /** article_type_tb.article_type 라벨. typeId가 마스터에 없거나 article 없으면 null. */
  articleType?: string | null;
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
  /** 게시글 제목 (일관성). */
  articleTitle?: string | null;
  articleTypeId?: number | null;
  articleType?: string | null;
}

export interface AdminCommentDetail extends AdminComment {
  articleTitle?: string | null;
  authorNickname?: string | null;
  authorEmail?: string;
  updatedAt?: string;
  reportCount: number;
  articleTypeId?: number | null;
  articleType?: string | null;
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

export interface PopularRegion {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PopularRegionCreatePayload {
  name: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
  displayOrder: number;
  isActive?: boolean;
}

export type PopularRegionUpdatePayload = Partial<PopularRegionCreatePayload>;

// ─── 포인트 운영 (Point Operations) ────────────────────────────────────────
export type PointType = 'EARN' | 'USE';
export type PointSource =
  | 'ATTENDANCE'
  | 'MISSION_CLAIM'
  | 'STREAK_BONUS'
  | 'ADMIN_GRANT'
  | 'ADMIN_REVOKE';

/** GET /users/{userId}/points/balance */
export interface PointBalance {
  userId: number;
  balance: number;
  lastUpdatedAt: string | null;
}

/** GET /users/{userId}/points/history items */
export interface PointHistoryItem {
  historyId: number;
  pointType: PointType;
  source: PointSource;
  /** 서버가 한글 라벨을 동봉 (예: "관리자 적립"). 누락 시 클라이언트가 매핑. */
  sourceLabel?: string;
  sourceRefId: number | null;
  amount: number;
  balanceAfter: number;
  title: string;
  reason: string | null;
  createdAt: string;
}

/** GET /users/{userId}/points/history 응답 */
export interface PointHistoryPage {
  items: PointHistoryItem[];
  nextCursor: number | null;
  hasMore: boolean;
}

/** POST /users/{userId}/points/grant body */
export interface PointGrantPayload {
  amount: number;
  reason: string;
}

/** POST /users/{userId}/points/revoke body */
export interface PointRevokePayload {
  amount: number;
  reason: string;
}

// ─── 운영 콘텐츠 (Terms / FAQ / OSS License) ───────────────────────────────

export type TermType = 'SERVICE' | 'PRIVACY' | 'LOCATION' | 'MARKETING';

export interface Term {
  termId: number;
  type: TermType;
  typeLabel: string;
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  isActive: boolean;
  isCurrentlyEffective: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface TermCreatePayload {
  type: TermType;
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  isActive?: boolean;
}

export type TermUpdatePayload = Partial<TermCreatePayload>;

export type FaqCategory = 'GENERAL' | 'ACCOUNT' | 'POINT' | 'SPOT' | 'COMMUNITY';

export interface Faq {
  faqId: number;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface FaqCreatePayload {
  category: FaqCategory;
  question: string;
  answer: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type FaqUpdatePayload = Partial<FaqCreatePayload>;

export interface OssLicense {
  ossLicenseId: number;
  name: string;
  version: string | null;
  licenseType: string;
  copyright: string | null;
  sourceUrl: string | null;
  licenseText: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface OssLicenseCreatePayload {
  name: string;
  version?: string | null;
  licenseType: string;
  copyright?: string | null;
  sourceUrl?: string | null;
  licenseText: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type OssLicenseUpdatePayload = Partial<OssLicenseCreatePayload>;

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
