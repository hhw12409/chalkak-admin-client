"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usersApi } from "@/lib/api/users";
import { userTitlesApi } from "@/lib/api/userTitles";
import { articlesApi } from "@/lib/api/articles";
import {
  AdminUser,
  AdminArticle,
  PageResponse,
  UserSanction,
  SanctionLevel,
  UserTitle,
} from "@/types/admin";
import MaskedField from "@/components/common/MaskedField";
import UnmaskModal from "@/components/common/UnmaskModal";
import Pagination from "@/components/common/Pagination";
import UserPointSection from "@/components/Users/UserPointSection";
import UserDangerZone from "@/components/Users/UserDangerZone";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E";

const sanctionLevels: { value: SanctionLevel; label: string }[] = [
  { value: "WARNING", label: "경고" },
  { value: "SUSPEND_7D", label: "7일 정지" },
  { value: "SUSPEND_30D", label: "30일 정지" },
  { value: "PERMANENT", label: "영구 정지" },
];

const sanctionStatusLabel: Record<string, string> = {
  ACTIVE: "적용 중",
  EXPIRED: "만료",
  REVOKED: "취소됨",
};

interface Props { userId: number; }

const ARTICLE_PAGE_SIZE = 10;

export default function UserDetailClient({ userId }: Props) {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sanctions, setSanctions] = useState<UserSanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [level, setLevel] = useState<SanctionLevel>("WARNING");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [unmaskField, setUnmaskField] = useState("");
  const [articles, setArticles] = useState<PageResponse<AdminArticle> | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState("");
  const [articlePage, setArticlePage] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  /** "" 면 미선택, 숫자 문자열은 직책 마스터 id */
  const [titleIdDraft, setTitleIdDraft] = useState<string>("");
  const [titleSubmitting, setTitleSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  /** 활성 직책 마스터 캐시 (마운트 시 1회 fetch + 편집 진입 시 lazy refresh 가능) */
  const titlesCacheRef = useRef<UserTitle[] | null>(null);
  const [activeTitles, setActiveTitles] = useState<UserTitle[]>([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [titlesError, setTitlesError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([usersApi.getUser(userId), usersApi.getUserSanctions(userId)])
      .then(([u, s]) => { setUser(u); setSanctions(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const loadArticles = (p: number) => {
    setArticlesLoading(true);
    setArticlesError("");
    articlesApi
      .getArticles({ userId, page: p, size: ARTICLE_PAGE_SIZE })
      .then(setArticles)
      .catch((e) => setArticlesError(e instanceof Error ? e.message : "게시글 목록을 불러올 수 없습니다."))
      .finally(() => setArticlesLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [userId]);

  useEffect(() => {
    loadArticles(articlePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, articlePage]);

  // 마운트 시 1회 활성 직책 마스터 캐시
  useEffect(() => {
    if (titlesCacheRef.current !== null) return;
    setTitlesLoading(true);
    setTitlesError("");
    userTitlesApi
      .list({ activeOnly: true })
      .then((rows) => {
        titlesCacheRef.current = rows;
        setActiveTitles(rows);
      })
      .catch((e) =>
        setTitlesError(
          e instanceof Error ? e.message : "활성 직책 목록을 불러오지 못했습니다."
        )
      )
      .finally(() => setTitlesLoading(false));
  }, []);

  const handleSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await usersApi.sanctionUser(userId, level, reason);
      setShowModal(false);
      setReason("");
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "제재 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditTitle = () => {
    setTitleIdDraft(user?.titleId != null ? String(user.titleId) : "");
    setTitleError("");
    setEditingTitle(true);
  };

  const cancelEditTitle = () => {
    setEditingTitle(false);
    setTitleIdDraft("");
    setTitleError("");
  };

  /** 선택된 draft가 비활성/삭제된 임시 옵션인지 여부 (옵션 B 가드용) */
  const isInactiveDraft = (() => {
    if (titleIdDraft === "") return false;
    const parsed = Number(titleIdDraft);
    if (!Number.isFinite(parsed) || parsed <= 0) return false;
    return !activeTitles.some((t) => t.id === parsed);
  })();

  const submitTitle = async () => {
    const parsedId: number | null =
      titleIdDraft === "" ? null : Number(titleIdDraft);
    if (parsedId !== null && (!Number.isFinite(parsedId) || parsedId <= 0)) {
      setTitleError("유효하지 않은 직책 선택입니다.");
      return;
    }
    // 옵션 B: 사전 검증 — 비활성/삭제된 직책은 부여 불가
    if (
      parsedId !== null &&
      !activeTitles.some((t) => t.id === parsedId)
    ) {
      setTitleError(
        "비활성화된 직책은 선택할 수 없습니다. 활성 직책을 선택하거나 [선택 안 함]으로 변경하세요."
      );
      return;
    }
    setTitleSubmitting(true);
    try {
      const updated = await usersApi.assignUserTitle(userId, parsedId);
      setUser(updated);
      setEditingTitle(false);
      setTitleIdDraft("");
      setTitleError("");
    } catch (e: unknown) {
      setTitleError(e instanceof Error ? e.message : "직책 수정에 실패했습니다.");
    } finally {
      setTitleSubmitting(false);
    }
  };

  const handleRevoke = async (sanctionId: number) => {
    if (!confirm("이 제재를 취소하시겠습니까?")) return;
    try {
      await usersApi.revokeSanction(userId, sanctionId);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "취소 실패");
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-400">불러오는 중...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">사용자 상세</h1>
      </div>

      <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5 flex items-center gap-5">
          <button
            onClick={() => user.profileImage && setShowImageViewer(true)}
            className={`shrink-0 ${user.profileImage ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.profileImage || DEFAULT_AVATAR}
              alt="프로필 이미지"
              className="h-20 w-20 rounded-full border border-stroke object-cover dark:border-strokedark"
            />
          </button>
          <div>
            <p className="text-lg font-semibold text-black dark:text-white">{user.nickname}</p>
            <p className="text-sm text-gray-500">
              <MaskedField
                value={user.email}
                masked={user.emailMasked}
                onReveal={() => {
                  setUnmaskField("이메일");
                  setShowUnmaskModal(true);
                }}
              />
            </p>
            {!user.profileImage && (
              <p className="mt-0.5 text-xs text-gray-400">프로필 이미지 없음</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Info label="ID" value={String(user.userId)} />
          <Info label="닉네임" value={user.nickname} />
          <div>
            <span className="text-xs text-gray-500">이메일</span>
            <p className="font-medium text-black dark:text-white">
              <MaskedField
                value={user.email}
                masked={user.emailMasked}
                onReveal={() => {
                  setUnmaskField("이메일");
                  setShowUnmaskModal(true);
                }}
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">전화번호</span>
            <p className="font-medium text-black dark:text-white">
              <MaskedField
                value={user.phoneNumber ?? "-"}
                masked={user.phoneNumberMasked ?? false}
                onReveal={() => {
                  setUnmaskField("전화번호");
                  setShowUnmaskModal(true);
                }}
              />
            </p>
          </div>
          <Info label="역할" value={user.role} />
          <Info label="로그인 타입" value={user.snsType ?? "-"} />
          <Info label="상태" value={user.status} />
          <Info label="비공개 계정" value={user.isPrivate ? "예" : "아니오"} />
          <Info label="가입일" value={user.createdAt?.slice(0, 10)} />
          {user.introduction && <Info label="소개" value={user.introduction} />}
          <div className="col-span-2 md:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500">직책 (클라이언트 닉네임 아래 표시)</span>
              {!editingTitle && (
                <button
                  type="button"
                  onClick={startEditTitle}
                  className="text-xs text-meta-1 hover:underline"
                >
                  {user.titleLabel ? "수정" : "추가"}
                </button>
              )}
            </div>
            {editingTitle ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {(() => {
                  // 현재 선택된 user.titleId 가 활성 목록에 없을 수도 있다 (이후 비활성/삭제).
                  // 그 경우 드롭다운에 임시 옵션으로 보존 노출.
                  const currentInList = activeTitles.some(
                    (t) => user.titleId != null && t.id === user.titleId
                  );
                  const hasAnyActive = activeTitles.length > 0;

                  if (!titlesLoading && !hasAnyActive && !user.titleId) {
                    return (
                      <div className="basis-full">
                        <p className="text-sm text-meta-1">
                          활성 직책이 없습니다. 직책 마스터를 먼저 등록해주세요.
                        </p>
                        <Link
                          href="/user-titles"
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                        >
                          → 직책 마스터 관리로 이동
                        </Link>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={cancelEditTitle}
                            className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark"
                          >
                            닫기
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      <select
                        value={titleIdDraft}
                        onChange={(e) => {
                          setTitleIdDraft(e.target.value);
                          setTitleError("");
                        }}
                        disabled={titleSubmitting || titlesLoading}
                        className="flex-1 min-w-[220px] rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                      >
                        <option value="">선택 안 함 (직책 해제)</option>
                        {!currentInList && user.titleId != null && (
                          // 옵션 A: 비활성/삭제된 현재 직책은 표시만 유지하고 선택 불가
                          <option
                            value={String(user.titleId)}
                            disabled
                            className="text-gray-400 dark:text-gray-500"
                          >
                            {user.titleLabel ?? `(id=${user.titleId})`} (현재 비활성/삭제 — 선택 불가)
                          </option>
                        )}
                        {activeTitles.map((t) => (
                          <option key={t.id} value={String(t.id)}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={submitTitle}
                        disabled={titleSubmitting || titlesLoading || isInactiveDraft}
                        className="rounded bg-meta-1 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
                      >
                        {titleSubmitting ? "저장 중..." : "저장"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditTitle}
                        disabled={titleSubmitting}
                        className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark"
                      >
                        취소
                      </button>
                      {titlesLoading && (
                        <span className="basis-full text-xs text-gray-400">
                          활성 직책 목록 불러오는 중...
                        </span>
                      )}
                      {titlesError && (
                        <span className="basis-full text-xs text-meta-1">{titlesError}</span>
                      )}
                      {titleError && (
                        <p className="basis-full text-xs text-meta-1">{titleError}</p>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="mt-1 font-medium text-black dark:text-white">
                {user.titleLabel ? (
                  <span className="inline-block rounded bg-meta-1/10 px-2 py-0.5 text-sm text-meta-1">
                    {user.titleLabel}
                  </span>
                ) : (
                  <span className="text-gray-400">미설정</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <UserPointSection userId={userId} canGrant={isAdmin} />

      <UserDangerZone
        userId={userId}
        userNickname={user.nickname}
        userStatus={user.status}
        onSuccess={load}
      />

      <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="font-semibold text-black dark:text-white">제재 이력</h2>
          <button
            onClick={() => setShowModal(true)}
            className="rounded bg-meta-1 px-3 py-1 text-sm text-white hover:bg-opacity-90"
          >
            + 제재 추가
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">수준</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">사유</th>
                <th className="px-4 py-3 text-left font-medium">처리자</th>
                <th className="px-4 py-3 text-left font-medium">만료일</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {sanctions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">제재 이력 없음</td></tr>
              ) : (
                sanctions.map((s) => (
                  <tr key={s.sanctionId} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-3">{sanctionLevels.find((l) => l.value === s.level)?.label ?? s.level}</td>
                    <td className="px-4 py-3">{sanctionStatusLabel[s.status] ?? s.status}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{s.reason}</td>
                    <td className="px-4 py-3">{s.adminUsername}</td>
                    <td className="px-4 py-3">{s.expiresAt?.slice(0, 10) ?? "-"}</td>
                    <td className="px-4 py-3">
                      {s.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRevoke(s.sanctionId)}
                          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                        >
                          취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="font-semibold text-black dark:text-white">
            작성 게시글
            {articles && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                총 {articles.totalElements.toLocaleString()}건
              </span>
            )}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">숨김</th>
                <th className="px-4 py-3 text-left font-medium">좋아요</th>
                <th className="px-4 py-3 text-left font-medium">댓글</th>
                <th className="px-4 py-3 text-left font-medium">작성일</th>
              </tr>
            </thead>
            <tbody>
              {articlesLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : articlesError ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-meta-1">{articlesError}</td></tr>
              ) : !articles || articles.content.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">작성한 게시글이 없습니다</td></tr>
              ) : (
                articles.content.map((article) => (
                  <tr key={article.articleId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{article.articleId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">{article.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        article.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" : "bg-meta-5/10 text-meta-5"
                      }`}>
                        {article.status === "ACTIVE" ? "활성" : "삭제됨"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {article.isHidden ? (
                        <span className="rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.actualLikeCount ?? article.likeCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.commentCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.createdAt?.slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {articles && articles.totalPages > 0 && (
          <Pagination
            page={articlePage}
            totalPages={articles.totalPages}
            totalElements={articles.totalElements}
            first={articles.first}
            last={articles.last}
            onPageChange={setArticlePage}
            itemLabel="건"
          />
        )}
      </div>

      {showImageViewer && user.profileImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowImageViewer(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.profileImage}
            alt="프로필 이미지 원본"
            className="max-h-[90vh] max-w-[90vw] rounded-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute right-4 top-4 text-white text-3xl leading-none hover:opacity-70"
          >
            &times;
          </button>
        </div>
      )}

      {showUnmaskModal && (
        <UnmaskModal
          targetType="USER"
          targetId={userId}
          fieldLabel={unmaskField}
          onClose={() => setShowUnmaskModal(false)}
          onSuccess={() => {
            setShowUnmaskModal(false);
            load();
          }}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">제재 추가</h3>
            <form onSubmit={handleSanction}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">제재 수준</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SanctionLevel)}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  {sanctionLevels.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">사유 *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="제재 사유를 입력하세요"
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">
                  취소
                </button>
                <button type="submit" disabled={submitting} className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
                  {submitting ? "처리 중..." : "제재 적용"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="font-medium text-black dark:text-white">{value ?? "-"}</p>
    </div>
  );
}
