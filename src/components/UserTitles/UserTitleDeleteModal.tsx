"use client";
import React, { useState } from "react";
import { userTitlesApi } from "@/lib/api/userTitles";
import { UserTitle } from "@/types/admin";

interface Props {
  title: UserTitle;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 직책 마스터 삭제 확인 모달.
 * - 라벨명 일치 입력 검증 (실수 방지)
 * - 서버는 soft delete + 해당 직책을 쓰는 사용자들의 title_id를 일괄 NULL 처리
 * - ESC / 오버레이 닫기 미구현 (실수 닫기 방지)
 */
export default function UserTitleDeleteModal({ title, onClose, onSuccess }: Props) {
  const [confirmText, setConfirmText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const canDelete = confirmText === title.label && !submitting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await userTitlesApi.remove(title.id);
      if (typeof window !== "undefined") {
        window.alert("삭제되었습니다");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
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
          직책 삭제 &mdash; &quot;{title.label}&quot;
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          이 직책을 사용 중인 모든 사용자의 직책이 해제됩니다(서버에서 일괄 처리).
          삭제 후 되돌릴 수 없습니다.
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">이중 확인</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`삭제하려면 "${title.label}"을 입력하세요`}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            disabled={submitting}
          />
        </div>

        {errorMsg && <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>}

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
