"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { articlesApi } from "@/lib/api/articles";
import { usersApi } from "@/lib/api/users";
import { AdminArticle, AdminArticleComment, AdminUser, PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";
import CsvExportButton from "@/components/common/CsvExportButton";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "삭제됨",
};

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E";

// YYYY-MM-DD → ISO datetime. from은 00:00:00, to는 23:59:59로 보정.
const toIsoFrom = (d: string) => (d ? `${d}T00:00:00` : undefined);
const toIsoTo = (d: string) => (d ? `${d}T23:59:59` : undefined);
const formatYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface ActionModalState {
  open: boolean;
  title: string;
  description?: string;
  inputLabel?: string;
  inputRequired?: boolean;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: (value?: string) => void;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error";
}

export default function ArticleListClient() {
  const [data, setData] = useState<PageResponse<AdminArticle> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [isHidden, setIsHidden] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailModal, setDetailModal] = useState<AdminArticle | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionModal, setActionModal] = useState<ActionModalState>({
    open: false,
    title: "",
    onConfirm: () => {},
  });
  const [actionInputValue, setActionInputValue] = useState("");
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "success" });
  const [authorModalUserId, setAuthorModalUserId] = useState<number | null>(null);
  const [authorModalData, setAuthorModalData] = useState<AdminUser | null>(null);
  const [authorModalLoading, setAuthorModalLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"info" | "comments">("info");
  const [articleComments, setArticleComments] = useState<AdminArticleComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const openActionModal = (config: Omit<ActionModalState, "open">) => {
    setActionInputValue("");
    setActionModal({ open: true, ...config });
  };

  const closeActionModal = () => {
    setActionModal((m) => ({ ...m, open: false }));
    setActionInputValue("");
  };

  const openAuthorModal = async (userId: number) => {
    setAuthorModalUserId(userId);
    setAuthorModalData(null);
    setAuthorModalLoading(true);
    try {
      const user = await usersApi.getUser(userId);
      setAuthorModalData(user);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "사용자 정보 로드 실패", "error");
    } finally {
      setAuthorModalLoading(false);
    }
  };

  const closeAuthorModal = () => {
    setAuthorModalUserId(null);
    setAuthorModalData(null);
  };

  const load = (p: number, kw: string, st: string, ih: string, fd: string, td: string) => {
    setLoading(true);
    articlesApi
      .getArticles({
        page: p,
        size: 20,
        keyword: kw || undefined,
        status: st || undefined,
        isHidden: ih === "" ? undefined : ih === "true",
        from: toIsoFrom(fd),
        to: toIsoTo(td),
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, keyword, status, isHidden, fromDate, toDate);
  }, [page, status, isHidden, fromDate, toDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, status, isHidden, fromDate, toDate);
    }, 300);
  };

  const applyRange = (days: number | null) => {
    if (days === null) {
      setFromDate("");
      setToDate("");
      setPage(0);
      return;
    }
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - (days - 1));
    setFromDate(formatYmd(from));
    setToDate(formatYmd(now));
    setPage(0);
  };

  const loadArticleComments = async (id: number) => {
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const list = await articlesApi.getArticleComments(id);
      setArticleComments(list);
    } catch (e: unknown) {
      setArticleComments([]);
      setCommentsError(e instanceof Error ? e.message : "댓글을 불러올 수 없습니다.");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (detailModal && detailTab === "comments") {
      loadArticleComments(detailModal.articleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailTab, detailModal?.articleId]);

  const refreshDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const full = await articlesApi.getArticle(id);
      setDetailModal(full);
    } catch {
      // ignore — list will still reflect the change
    } finally {
      setDetailLoading(false);
    }
  };

  const handleHide = (id: number, onDone?: () => void) => {
    openActionModal({
      title: "게시글 숨김 처리",
      description: "숨김 처리된 게시글은 일반 사용자에게 노출되지 않습니다.",
      inputLabel: "사유 (선택)",
      confirmLabel: "숨김 처리",
      confirmColor: "bg-meta-6",
      onConfirm: async (reason) => {
        closeActionModal();
        setActionLoading(id);
        try {
          await articlesApi.hideArticle(id, reason || undefined);
          showToast("게시글이 숨김 처리되었습니다.");
          load(page, keyword, status, isHidden, fromDate, toDate);
          onDone?.();
        } catch (e: unknown) {
          showToast(e instanceof Error ? e.message : "숨김 처리 실패", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUnhide = (id: number, onDone?: () => void) => {
    openActionModal({
      title: "숨김 해제",
      description: "이 게시글을 다시 공개 상태로 전환하시겠습니까?",
      confirmLabel: "숨김 해제",
      confirmColor: "bg-meta-3",
      onConfirm: async () => {
        closeActionModal();
        setActionLoading(id);
        try {
          await articlesApi.unhideArticle(id);
          showToast("숨김이 해제되었습니다.");
          load(page, keyword, status, isHidden, fromDate, toDate);
          onDone?.();
        } catch (e: unknown) {
          showToast(e instanceof Error ? e.message : "숨김 해제 실패", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDelete = (id: number, onDone?: () => void) => {
    openActionModal({
      title: "게시글 삭제",
      description: "삭제된 게시글은 30일 이내에 복원할 수 있습니다.",
      inputLabel: "삭제 사유 (필수)",
      inputRequired: true,
      confirmLabel: "삭제",
      confirmColor: "bg-meta-1",
      onConfirm: async (reason) => {
        closeActionModal();
        setActionLoading(id);
        try {
          await articlesApi.deleteArticle(id, reason);
          showToast("게시글이 삭제되었습니다.");
          load(page, keyword, status, isHidden, fromDate, toDate);
          onDone?.();
        } catch (e: unknown) {
          showToast(e instanceof Error ? e.message : "삭제 실패", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleRestore = (id: number, onDone?: () => void) => {
    openActionModal({
      title: "게시글 복원",
      description: "이 게시글을 활성 상태로 복원하시겠습니까?",
      confirmLabel: "복원",
      confirmColor: "bg-primary",
      onConfirm: async () => {
        closeActionModal();
        setActionLoading(id);
        try {
          await articlesApi.restoreArticle(id);
          showToast("게시글이 복원되었습니다.");
          load(page, keyword, status, isHidden, fromDate, toDate);
          onDone?.();
        } catch (e: unknown) {
          showToast(e instanceof Error ? e.message : "복원 실패", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const canConfirmModal = !actionModal.inputRequired || actionInputValue.trim().length > 0;

  return (
    <div>
      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-md px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        } ${toast.type === "success" ? "bg-meta-3" : "bg-meta-1"}`}
      >
        {toast.message}
      </div>

      {/* Action modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h4 className="mb-2 text-base font-semibold text-black dark:text-white">{actionModal.title}</h4>
            {actionModal.description && (
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{actionModal.description}</p>
            )}
            {actionModal.inputLabel && (
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {actionModal.inputLabel}
                </label>
                <input
                  type="text"
                  value={actionInputValue}
                  onChange={(e) => setActionInputValue(e.target.value)}
                  autoFocus
                  placeholder={actionModal.inputRequired ? "필수 입력" : "선택 입력"}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canConfirmModal) actionModal.onConfirm(actionInputValue || undefined);
                    if (e.key === "Escape") closeActionModal();
                  }}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeActionModal}
                className="rounded border border-stroke px-4 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                취소
              </button>
              <button
                onClick={() => actionModal.onConfirm(actionInputValue || undefined)}
                disabled={!canConfirmModal}
                className={`rounded px-4 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40 ${actionModal.confirmColor ?? "bg-primary"}`}
              >
                {actionModal.confirmLabel ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">콘텐츠 관리</h1>
        <CsvExportButton
          exportPath="/articles/export"
          requiredRole="OPERATOR"
          label="콘텐츠 CSV"
          fallbackFilename="chalkak_admin_articles.csv"
          filterParams={{
            status,
            isHidden: isHidden === "" ? undefined : isHidden,
            keyword,
            from: toIsoFrom(fromDate),
            to: toIsoTo(toDate),
          }}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="제목·내용 검색"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="DELETED">삭제됨</option>
        </select>
        <select
          value={isHidden}
          onChange={(e) => { setIsHidden(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">숨김 여부 전체</option>
          <option value="true">숨김</option>
          <option value="false">공개</option>
        </select>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            aria-label="시작일"
          />
          <span className="text-sm text-gray-500">~</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            aria-label="종료일"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyRange(7)}
            className="rounded border border-stroke px-2 py-2 text-xs hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            최근 7일
          </button>
          <button
            type="button"
            onClick={() => applyRange(30)}
            className="rounded border border-stroke px-2 py-2 text-xs hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            최근 30일
          </button>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => applyRange(null)}
              className="rounded border border-stroke px-2 py-2 text-xs hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              전체
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">작성자</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">숨김</th>
                <th className="px-4 py-3 text-left font-medium">조회</th>
                <th className="px-4 py-3 text-left font-medium">좋아요</th>
                <th className="px-4 py-3 text-left font-medium">댓글</th>
                <th className="px-4 py-3 text-left font-medium">작성일</th>
                <th className="px-4 py-3 text-left font-medium">상세</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">게시글이 없습니다</td></tr>
              ) : (
                data?.content.map((article) => (
                  <tr key={article.articleId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{article.articleId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">{article.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openAuthorModal(article.userId)}
                        disabled={!article.authorNickname && !article.authorEmail}
                        className="text-left hover:underline disabled:no-underline disabled:cursor-default"
                      >
                        <div className="text-xs text-gray-400">#{article.userId}</div>
                        <div className="font-medium text-black dark:text-white">
                          {article.authorNickname ?? "(탈퇴 계정)"}
                        </div>
                        {article.authorEmail && (
                          <div className="text-xs text-gray-500">{article.authorEmail}</div>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        article.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" : "bg-meta-5/10 text-meta-5"
                      }`}>
                        {statusLabel[article.status] ?? article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {article.isHidden ? (
                        <span className="rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.readCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.actualLikeCount ?? article.likeCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.commentCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          setCurrentImageIndex(0);
                          setDetailTab("info");
                          setArticleComments([]);
                          setCommentsError("");
                          setDetailLoading(true);
                          setDetailModal(article);
                          try {
                            const full = await articlesApi.getArticle(article.articleId);
                            setDetailModal(full);
                          } catch (e: unknown) {
                            showToast(e instanceof Error ? e.message : "상세 정보 로드 실패", "error");
                            setDetailModal(null);
                          } finally {
                            setDetailLoading(false);
                          }
                        }}
                        className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                      >
                        상세
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {article.isHidden ? (
                          <button
                            onClick={() => handleUnhide(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-3 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김해제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-6 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김
                          </button>
                        )}
                        {article.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleDelete(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            삭제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            복원
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            first={data.first}
            last={data.last}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="원본 이미지"
            className="max-h-[90vh] max-w-[90vw] rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 text-white text-3xl leading-none hover:opacity-70"
          >
            &times;
          </button>
        </div>
      )}

      {/* Detail modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2 pr-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">{detailModal.title}</h3>
                {detailModal.isHidden && (
                  <span className="shrink-0 rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                )}
                {detailModal.status === "DELETED" && (
                  <span className="shrink-0 rounded bg-meta-5/10 px-2 py-0.5 text-xs font-medium text-meta-5">삭제됨</span>
                )}
              </div>
              <button
                onClick={() => { setDetailModal(null); setSelectedImage(null); }}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex border-b border-stroke dark:border-strokedark">
              <button
                onClick={() => setDetailTab("info")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  detailTab === "info"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                상세 정보
              </button>
              <button
                onClick={() => setDetailTab("comments")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  detailTab === "comments"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                댓글 {detailModal.commentCount != null && `(${detailModal.commentCount})`}
              </button>
            </div>

            {detailTab === "comments" ? (
              <div className="mb-4">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : commentsError ? (
                  <div className="rounded border border-stroke p-4 text-center text-sm text-meta-1 dark:border-strokedark">
                    {commentsError}
                  </div>
                ) : articleComments.length === 0 ? (
                  <div className="rounded border border-dashed border-stroke p-8 text-center text-sm text-gray-400 dark:border-strokedark">
                    댓글이 없습니다
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {articleComments.map((c) => (
                      <li
                        key={c.articleCommentId}
                        className={`rounded border border-stroke p-3 dark:border-strokedark ${
                          c.status === "DELETED" || c.isHidden ? "bg-gray-1 dark:bg-meta-4" : ""
                        }`}
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-medium text-black dark:text-white">
                            {c.authorNickname || c.authorUsername || `#${c.userId}`}
                          </span>
                          <span className="text-gray-400">
                            {c.createdAt?.slice(0, 10)}
                          </span>
                          {c.parentCommentId != null && (
                            <span className="rounded bg-gray-2 px-1.5 py-0.5 text-gray-500 dark:bg-meta-4 dark:text-gray-400">
                              ↳ 대댓글
                            </span>
                          )}
                          {c.isHidden && (
                            <span className="rounded bg-meta-6/10 px-1.5 py-0.5 font-medium text-meta-6">
                              숨김
                            </span>
                          )}
                          {c.status === "DELETED" && (
                            <span className="rounded bg-meta-5/10 px-1.5 py-0.5 font-medium text-meta-5">
                              삭제됨
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                          {c.comment}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
            {/* Meta */}
            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">게시글 ID:</span> {detailModal.articleId}</p>
              <p className="col-span-2">
                <span className="font-medium">작성자:</span>{" "}
                <button
                  onClick={() => openAuthorModal(detailModal.userId)}
                  disabled={!detailModal.authorNickname && !detailModal.authorEmail}
                  className="text-primary hover:underline disabled:no-underline disabled:text-gray-500"
                >
                  #{detailModal.userId} {detailModal.authorNickname ?? "(탈퇴 계정)"}
                  {detailModal.authorEmail && ` · ${detailModal.authorEmail}`}
                </button>
              </p>
              <p><span className="font-medium">카테고리:</span> {detailModal.category ?? "-"}</p>
              <p><span className="font-medium">타입 ID:</span> {detailModal.articleTypeId}</p>
              <p>
                <span className="font-medium">상태:</span>{" "}
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  detailModal.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" : "bg-meta-5/10 text-meta-5"
                }`}>
                  {statusLabel[detailModal.status] ?? detailModal.status}
                </span>
              </p>
              <p>
                <span className="font-medium">숨김:</span>{" "}
                {detailModal.isHidden
                  ? <span className="rounded bg-meta-6/10 px-1.5 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                  : <span className="text-gray-400">공개</span>
                }
              </p>
              <p><span className="font-medium">조회수:</span> {(detailModal.readCount ?? 0).toLocaleString()}</p>
              <p>
                <span className="font-medium">좋아요:</span>{" "}
                {(detailModal.actualLikeCount ?? detailModal.likeCount ?? 0).toLocaleString()}
                {detailModal.actualLikeCount != null &&
                  detailModal.likeCount != null &&
                  detailModal.actualLikeCount !== detailModal.likeCount && (
                    <span className="ml-1 text-xs text-gray-400">
                      (캐시: {detailModal.likeCount.toLocaleString()})
                    </span>
                  )}
              </p>
              <p><span className="font-medium">댓글 수:</span> {(detailModal.commentCount ?? 0).toLocaleString()}</p>
              {detailModal.location && (
                <p className="col-span-2"><span className="font-medium">위치:</span> {detailModal.location}</p>
              )}
              {detailModal.latitude != null && detailModal.longitude != null && (
                <p className="col-span-2"><span className="font-medium">좌표:</span> {detailModal.latitude}, {detailModal.longitude}</p>
              )}
              <p><span className="font-medium">작성일:</span> {detailModal.createdAt?.slice(0, 16).replace("T", " ")}</p>
              <p><span className="font-medium">수정일:</span> {detailModal.updatedAt?.slice(0, 16).replace("T", " ")}</p>
            </div>

            {/* Body */}
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-black dark:text-white">본문</p>
              <div className="rounded border border-stroke p-3 dark:border-strokedark">
                {detailLoading ? (
                  <p className="text-sm text-gray-400">불러오는 중...</p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {detailModal.content || "(내용 없음)"}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-black dark:text-white">
                이미지 ({detailModal.images?.length ?? 0}장)
              </p>
              {detailLoading ? (
                <div className="flex h-48 items-center justify-center rounded border border-stroke bg-gray-1 dark:border-strokedark dark:bg-meta-4">
                  <span className="text-sm text-gray-400">불러오는 중...</span>
                </div>
              ) : detailModal.images && detailModal.images.length > 0 ? (
                <>
                  <div className="relative overflow-hidden rounded border border-stroke bg-black dark:border-strokedark" style={{ aspectRatio: "4/3" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detailModal.images[currentImageIndex]}
                      alt={`이미지 ${currentImageIndex + 1}`}
                      className="h-full w-full cursor-zoom-in object-contain"
                      onClick={() => setSelectedImage(detailModal.images![currentImageIndex])}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                    {detailModal.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i - 1 + detailModal.images!.length) % detailModal.images!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i + 1) % detailModal.images!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                          {detailModal.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <span className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                      {currentImageIndex + 1} / {detailModal.images.length}
                    </span>
                  </div>
                  {detailModal.images.length > 1 && (
                    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                      {detailModal.images.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-colors ${i === currentImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-32 items-center justify-center rounded border border-dashed border-stroke bg-gray-1 dark:border-strokedark dark:bg-meta-4">
                  <span className="text-sm text-gray-400">이미지 없음</span>
                </div>
              )}
            </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {detailModal.isHidden ? (
                <button
                  onClick={() => {
                    const id = detailModal.articleId;
                    handleUnhide(id, () => refreshDetail(id));
                  }}
                  disabled={actionLoading === detailModal.articleId || detailLoading}
                  className="rounded bg-meta-3 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  숨김 해제
                </button>
              ) : (
                <button
                  onClick={() => {
                    const id = detailModal.articleId;
                    handleHide(id, () => refreshDetail(id));
                  }}
                  disabled={actionLoading === detailModal.articleId || detailLoading}
                  className="rounded bg-meta-6 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  숨김 처리
                </button>
              )}
              {detailModal.status === "ACTIVE" ? (
                <button
                  onClick={() => {
                    const id = detailModal.articleId;
                    handleDelete(id, () => setDetailModal(null));
                  }}
                  disabled={actionLoading === detailModal.articleId || detailLoading}
                  className="rounded bg-meta-1 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  삭제
                </button>
              ) : (
                <button
                  onClick={() => {
                    const id = detailModal.articleId;
                    handleRestore(id, () => setDetailModal(null));
                  }}
                  disabled={actionLoading === detailModal.articleId || detailLoading}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  복원
                </button>
              )}
              <button
                onClick={() => { setDetailModal(null); setSelectedImage(null); }}
                className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author info modal */}
      {authorModalUserId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-black dark:text-white">작성자 정보</h3>
              <button
                onClick={closeAuthorModal}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {authorModalLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">불러오는 중...</div>
            ) : authorModalData ? (
              <>
                <div className="mb-5 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={authorModalData.profileImage || DEFAULT_AVATAR}
                    alt="프로필 이미지"
                    className="h-16 w-16 shrink-0 rounded-full border border-stroke object-cover dark:border-strokedark"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-black dark:text-white">
                      {authorModalData.nickname}
                    </p>
                    <p className="truncate text-sm text-gray-500">{authorModalData.email}</p>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <AuthorInfo label="ID" value={String(authorModalData.userId)} />
                  <AuthorInfo label="역할" value={authorModalData.role} />
                  <AuthorInfo label="상태" value={authorModalData.status} />
                  <AuthorInfo
                    label="비공개 계정"
                    value={authorModalData.isPrivate ? "예" : "아니오"}
                  />
                  <AuthorInfo
                    label="가입일"
                    value={authorModalData.createdAt?.slice(0, 10) ?? "-"}
                  />
                  <AuthorInfo label="SNS 타입" value={authorModalData.snsType ?? "-"} />
                  {authorModalData.introduction && (
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">소개</span>
                      <p className="whitespace-pre-wrap font-medium text-black dark:text-white">
                        {authorModalData.introduction}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Link
                    href={`/users/${authorModalData.userId}`}
                    target="_blank"
                    className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                  >
                    사용자 페이지로 이동
                  </Link>
                  <button
                    onClick={closeAuthorModal}
                    className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                  >
                    닫기
                  </button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-sm text-gray-400">
                사용자 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="font-medium text-black dark:text-white">{value ?? "-"}</p>
    </div>
  );
}
