export type AdminRole = 'VIEWER' | 'OPERATOR' | 'ADMIN';
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
  nickname: string;
  phoneNumber?: string;
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
  title: string;
  content: string;
  readCount: number | null;
  likeCount: number | null;
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
  firstReportedAt: string;
  lastReportedAt: string;
  topReason: string;
  targetPreview: TargetPreview;
}

export interface ReportDetail {
  reportId: number;
  reporterUserId: number;
  reason: string;
  description?: string;
  reportedAt: string;
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
  result: AuditResult;
  errorMessage?: string;
  createdAt: string;
}

export interface PopularKeyword {
  keyword: string;
  rank: number;
  rankChange: number;
  searchCount: number;
}

export interface SearchKeyword {
  searchKeywordId: number;
  searchKeyword: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceType {
  typeId: number;
  typeName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleType {
  articleTypeId: number;
  articleType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  boardId: number;
  boardName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface AdminUserAccount {
  adminId: number;
  username: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
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
}

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
