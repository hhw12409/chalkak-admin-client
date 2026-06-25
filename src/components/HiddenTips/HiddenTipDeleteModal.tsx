"use client";
import React, { useState } from "react";
import { hiddenTipsApi } from "@/lib/api/hiddenTips";
import { HiddenTip } from "@/types/admin";

interface Props {
  tip: HiddenTip;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 히든팁 soft delete 확인 모달.
 * - 부적절 콘텐츠 차단 사유 입력(선택) + status=DELETED 처리.
 */
export default function HiddenTipDeleteModal({ tip, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      await hiddenTipsApi.remove(tip.tipId);
      if (typeof window !== "undefined") window.alert("삭제되었습니다");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      if (message.includes("찾을 수 없습니다")) {
        if (typeof window !== "undefined") window.alert("이미 삭제된 항목입니다.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-1">
          히든팁 삭제 (#{tip.tipId})
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          히든팁이 소프트 삭제(status=DELETED)되어 사용자 노출에서 제외됩니다.
        </div>

        <div className="mb-4 rounded border border-stroke p-3 text-sm dark:border-strokedark">
          <p className="font-medium text-black dark:text-white">{tip.title}</p>
          <p className="mt-1 line-clamp-3 text-gray-500">{tip.content}</p>
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
            disabled={submitting}
            className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
          >
            {submitting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
