"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { commentsApi } from "@/lib/api/comments";
import { usersApi } from "@/lib/api/users";
import Pagination from "@/components/common/Pagination";
import {
  AdminComment,
  AdminCommentDetail,
  AdminUser,
  PageResponse,
  ReportDetail,
} from "@/types/admin";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "삭제됨",
};

const reasonLabel: Record<string, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절",
  VIOLENCE: "폭력",
  COPYRIGHT: "저작권",
  FALSE_INFO: "허위정보",
  ETC: "기타",
};

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E";

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

export default function CommentListClient() {
  const [data, setData] = useState<PageResponse<AdminComment> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [isHidden, setIsHidden] = useState("");
  const [isReported, setIsReported] = useState(false);
  const [articleIdFilter, setArticleIdFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailModal, setDetailModal] = useState<AdminCommentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
  const [reportsModalCommentId, setReportsModalCommentId] = useState<number | null>(null);
  const [reportsModalData, setReportsModalData] = useState<ReportDetail[] | null>(null);
  const [reportsModalLoading, setReportsModalLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const openReportsModal = async (commentId: number) => {
    setReportsModalCommentId(commentId);
    setReportsModalData(null);
    setReportsModalLoading(true);
    try {
      const reports = await commentsApi.getCommentReports(commentId);
      setReportsModalData(reports);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "신고 이력 로드 실패", "error");
      setReportsModalData([]);
    } finally {
      setReportsModalLoading(false);
    }
  };

  const closeReportsModal = () => {
    setReportsModalCommentId(null);
    setReportsModalData(null);
  };

  const load = (
    p: number,
    kw: string,
    st: string,
    ih: string,
    ir: boolean,
    aid: string,
    uid: string,
  ) => {
    setLoading(true);
    commentsApi
      .getComments({
        page: p,
        size: 20,
        keyword: kw || undefined,
        status: st || undefined,
        isHidden: ih === "" ? undefined : ih === "true",
        isReported: ir || undefined,
        articleId: aid ? Number(aid) : undefined,
        userId: uid ? Number(uid) : undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, keyword, status, isHidden, isReported, articleIdFilter, userIdFilter);
  }, [page, status, isHidden, isReported]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, status, isHidden, isReported, articleIdFilter, userIdFilter);
    }, 300);
  };

  const handleArticleIdChange = (val: string) => {
    setArticleIdFilter(val);
    if (articleDebounceRef.current) clearTimeout(articleDebounceRef.current);
    articleDebounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, keyword, status, isHidden, isReported, val, userIdFilter);
    }, 300);
  };

  const handleUserIdChange = (val: string) => {
    setUserIdFilter(val);
    if (userDebounceRef.current) clearTimeout(userDebounceRef.current);
    userDebounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, keyword, status, isHidden, isReported, articleIdFilter, val);
    }, 300);
  };

  const refreshDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const full = await commentsApi.getComment(id);
      setDetailModal(full);
    } catch {
      // ignore — list will still reflect the change
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadList = () =>
    load(page, keyword, status, isHidden, isReported, articleIdFilter, userIdFilter);

  const handleHide = (id: number, onDone?: () => void) => {
    openActionModal({
      title: "댓글 숨김 처리",
      description: "숨김 처리된 댓글은 일반 사용자에게 노출되지 않습니다.",
      inputLabel: "사유 (선택)",
      confirmLabel: "숨김 처리",
      confirmColor: "bg-meta-6",
      onConfirm: async (reason) => {
        closeActionModal();
        setActionLoading(id);
        try {
          await commentsApi.hideComment(id, reason || undefined);
          showToast("댓글이 숨김 처리되었습니다.");
          reloadList();
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
      description: "이 댓글을 다시 공개 상태로 전환하시겠습니까?",
      confirmLabel: "숨김 해제",
      confirmColor: "bg-meta-3",
      onConfirm: async () => {
        closeActionModal();
        setActionLoading(id);
        try {
          await commentsApi.unhideComment(id);
          showToast("숨김이 해제되었습니다.");
          reloadList();
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
      title: "댓글 삭제",
      description: "삭제된 댓글은 복원할 수 있습니다.",
      inputLabel: "삭제 사유 (필수)",
      inputRequired: true,
      confirmLabel: "삭제",
      confirmColor: "bg-meta-1",
      onConfirm: async (reason) => {
        closeActionModal();
        setActionLoading(id);
        try {
          await commentsApi.deleteComment(id, reason);
          showToast("댓글이 삭제되었습니다.");
          reloadList();
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
      title: "댓글 복원",
      description: "이 댓글을 활성 상태로 복원하시겠습니까?",
      confirmLabel: "복원",
      confirmColor: "bg-primary",
      onConfirm: async () => {
        closeActionModal();
        setActionLoading(id);
        try {
          await commentsApi.restoreComment(id);
          showToast("댓글이 복원되었습니다.");
          reloadList();
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">댓글 관리</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="내용 검색"
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
        <input
          type="number"
          placeholder="게시글 ID"
          value={articleIdFilter}
          onChange={(e) => handleArticleIdChange(e.target.value)}
          className="w-32 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <input
          type="number"
          placeholder="작성자 ID"
          value={userIdFilter}
          onChange={(e) => handleUserIdChange(e.target.value)}
          className="w-32 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <label className="flex items-center gap-2 rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:text-white">
          <input
            type="checkbox"
            checked={isReported}
            onChange={(e) => { setIsReported(e.target.checked); setPage(0); }}
          />
          신고된 댓글만
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">게시글 ID</th>
                <th className="px-4 py-3 text-left font-medium">작성자</th>
                <th className="px-4 py-3 text-left font-medium">내용</th>
                <th className="px-4 py-3 text-left font-medium">부모 ID</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">숨김</th>
                <th className="px-4 py-3 text-left font-medium">신고</th>
                <th className="px-4 py-3 text-left font-medium">작성일</th>
                <th className="px-4 py-3 text-left font-medium">상세</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data === null ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">데이터를 불러오지 못했습니다.</td></tr>
              ) : data.content.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">댓글이 없습니다</td></tr>
              ) : (
                data.content.map((comment) => (
                  <tr key={comment.articleCommentId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{comment.articleCommentId}</td>
                    <td className="px-4 py-3 text-gray-500">{comment.articleId}</td>
                    <td className="px-4 py-3">
                      {comment.userId != null ? (
                        <button
                          onClick={() => openAuthorModal(comment.userId!)}
                          className="text-left hover:underline"
                        >
                          <div className="text-xs text-gray-400">#{comment.userId}</div>
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 text-black dark:text-white">{comment.comment}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {comment.parentCommentId ?? <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        comment.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" : "bg-meta-5/10 text-meta-5"
                      }`}>
                        {statusLabel[comment.status] ?? comment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {comment.isHidden ? (
                        <span className="rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(comment.reportCount ?? 0) > 0 ? (
                        <button
                          onClick={() => openReportsModal(comment.articleCommentId)}
                          className="rounded bg-meta-1/10 px-2 py-0.5 text-xs font-medium text-meta-1 hover:bg-meta-1/20"
                        >
                          {comment.reportCount}건
                        </button>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{comment.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          setDetailLoading(true);
                          setDetailModal({
                            ...comment,
                            reportCount: comment.reportCount ?? 0,
                          } as AdminCommentDetail);
                          try {
                            const full = await commentsApi.getComment(comment.articleCommentId);
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
                        {comment.isHidden ? (
                          <button
                            onClick={() => handleUnhide(comment.articleCommentId)}
                            disabled={actionLoading === comment.articleCommentId}
                            className="rounded bg-meta-3 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김해제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(comment.articleCommentId)}
                            disabled={actionLoading === comment.articleCommentId}
                            className="rounded bg-meta-6 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김
                          </button>
                        )}
                        {comment.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleDelete(comment.articleCommentId)}
                            disabled={actionLoading === comment.articleCommentId}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            삭제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(comment.articleCommentId)}
                            disabled={actionLoading === comment.articleCommentId}
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

      {/* Detail modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2 pr-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">댓글 #{detailModal.articleCommentId}</h3>
                {detailModal.isHidden && (
                  <span className="shrink-0 rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                )}
                {detailModal.status === "DELETED" && (
                  <span className="shrink-0 rounded bg-meta-5/10 px-2 py-0.5 text-xs font-medium text-meta-5">삭제됨</span>
                )}
                {detailModal.reportCount > 0 && (
                  <span className="shrink-0 rounded bg-meta-1/10 px-2 py-0.5 text-xs font-medium text-meta-1">
                    신고 {detailModal.reportCount}건
                  </span>
                )}
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Meta */}
            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">게시글 ID:</span> {detailModal.articleId}</p>
              {detailModal.articleTitle && (
                <p className="col-span-2">
                  <span className="font-medium">게시글 제목:</span> {detailModal.articleTitle}
                </p>
              )}
              <p className="col-span-2">
                <span className="font-medium">작성자:</span>{" "}
                {detailLoading ? (
                  <span className="text-gray-400">로딩 중...</span>
                ) : (
                  <button
                    onClick={() => detailModal.userId != null && openAuthorModal(detailModal.userId)}
                    className="text-primary hover:underline"
                  >
                    {detailModal.userId != null ? `#${detailModal.userId} ` : ""}
                    {detailModal.authorNickname ?? "(탈퇴 계정)"}
                    {detailModal.authorEmail && ` · ${detailModal.authorEmail}`}
                  </button>
                )}
              </p>
              {detailModal.parentCommentId && (
                <p><span className="font-medium">부모 댓글 ID:</span> {detailModal.parentCommentId}</p>
              )}
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
              <p><span className="font-medium">미처리 신고:</span> {detailModal.reportCount}건</p>
              <p><span className="font-medium">작성일:</span> {detailModal.createdAt?.slice(0, 16).replace("T", " ")}</p>
              {detailModal.updatedAt && (
                <p><span className="font-medium">수정일:</span> {detailModal.updatedAt.slice(0, 16).replace("T", " ")}</p>
              )}
            </div>

            {/* Body */}
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-black dark:text-white">댓글 본문</p>
              <div className="rounded border border-stroke p-3 dark:border-strokedark">
                {detailLoading ? (
                  <p className="text-sm text-gray-400">불러오는 중...</p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {detailModal.comment || "(내용 없음)"}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {detailModal.reportCount > 0 && (
                <button
                  onClick={() => openReportsModal(detailModal.articleCommentId)}
                  className="rounded bg-meta-1/10 px-3 py-1.5 text-sm text-meta-1 hover:bg-meta-1/20"
                >
                  신고 이력 ({detailModal.reportCount})
                </button>
              )}
              {detailModal.isHidden ? (
                <button
                  onClick={() => {
                    const id = detailModal.articleCommentId;
                    handleUnhide(id, () => refreshDetail(id));
                  }}
                  disabled={actionLoading === detailModal.articleCommentId || detailLoading}
                  className="rounded bg-meta-3 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  숨김 해제
                </button>
              ) : (
                <button
                  onClick={() => {
                    const id = detailModal.articleCommentId;
                    handleHide(id, () => refreshDetail(id));
                  }}
                  disabled={actionLoading === detailModal.articleCommentId || detailLoading}
                  className="rounded bg-meta-6 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  숨김 처리
                </button>
              )}
              {detailModal.status === "ACTIVE" ? (
                <button
                  onClick={() => {
                    const id = detailModal.articleCommentId;
                    handleDelete(id, () => setDetailModal(null));
                  }}
                  disabled={actionLoading === detailModal.articleCommentId || detailLoading}
                  className="rounded bg-meta-1 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  삭제
                </button>
              ) : (
                <button
                  onClick={() => {
                    const id = detailModal.articleCommentId;
                    handleRestore(id, () => setDetailModal(null));
                  }}
                  disabled={actionLoading === detailModal.articleCommentId || detailLoading}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  복원
                </button>
              )}
              <button
                onClick={() => setDetailModal(null)}
                className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author modal */}
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

      {/* Reports modal */}
      {reportsModalCommentId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                댓글 #{reportsModalCommentId} 신고 이력
              </h3>
              <button
                onClick={closeReportsModal}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {reportsModalLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">불러오는 중...</div>
            ) : !reportsModalData || reportsModalData.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">신고 이력이 없습니다.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <th className="px-2 py-2 text-left font-medium">신고 ID</th>
                    <th className="px-2 py-2 text-left font-medium">신고자 ID</th>
                    <th className="px-2 py-2 text-left font-medium">사유</th>
                    <th className="px-2 py-2 text-left font-medium">설명</th>
                    <th className="px-2 py-2 text-left font-medium">신고일</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsModalData.map((d) => (
                    <tr key={d.reportId} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-2 py-2 text-gray-500">{d.reportId}</td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => openAuthorModal(d.reporterUserId)}
                          className="text-primary hover:underline"
                        >
                          #{d.reporterUserId}
                        </button>
                      </td>
                      <td className="px-2 py-2">{reasonLabel[d.reason] ?? d.reason}</td>
                      <td className="px-2 py-2 max-w-xs">
                        <span className="line-clamp-2 text-gray-700 dark:text-gray-300">
                          {d.description ?? "-"}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-gray-500">{d.reportedAt?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeReportsModal}
                className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                닫기
              </button>
            </div>
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
