"use client";
import React, { useState } from "react";
import { keywordsApi } from "@/lib/api/keywords";
import { PopularKeyword } from "@/types/admin";

interface Props {
  keyword: PopularKeyword;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PopularKeywordDeleteModal({ keyword, onClose, onSuccess }: Props) {
  const [reorder, setReorder] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ESC / 오버레이 닫기는 의도적으로 미구현 (실수 닫기 방지)

  const canDelete = confirmText === keyword.keyword && !submitting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await keywordsApi.deletePopularKeyword(keyword.popularKeywordId, {
        reorder,
        reason: reason.trim() || undefined,
      });
      if (typeof window !== "undefined") {
        window.alert("삭제되었습니다");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      // 404 (값을 찾을 수 없습니다.) — 이미 삭제된 항목
      if (message.includes("찾을 수 없습니다")) {
        if (typeof window !== "undefined") {
          window.alert("이미 삭제된 항목입니다.");
        }
        onSuccess();
        onClose();
      } else {
        setErrorMsg(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-1">
          긴급 삭제 &mdash; &quot;{keyword.keyword}&quot;
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          이 작업은 현재 노출 중인 인기검색어에서 즉시 제거합니다. 다음 정시 배치(매시 0분)까지 유효합니다. 되돌릴 수 없습니다.
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reorder}
              onChange={(e) => setReorder(e.target.checked)}
              className="h-4 w-4"
            />
            <span>삭제 후 나머지 순위 1부터 재정렬</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">삭제 사유</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="삭제 사유 (감사 로그용, 선택)"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">이중 확인</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`삭제하려면 "${keyword.keyword}"를 입력하세요`}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 disabled:opacity-60 dark:border-strokedark dark:hover:bg-meta-4"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className={`rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canDelete ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
