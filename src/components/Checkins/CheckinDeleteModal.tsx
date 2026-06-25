"use client";
import React, { useState } from "react";
import { checkinsApi } from "@/lib/api/checkins";
import { Checkin } from "@/types/admin";

interface Props {
  checkin: Checkin;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 체크인 물리 삭제 확인 모달.
 * - status 컬럼이 없어 물리 삭제(되돌릴 수 없음). 부적절 방명록 메시지 차단 용도.
 */
export default function CheckinDeleteModal({ checkin, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      await checkinsApi.remove(checkin.checkinId);
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
          체크인 삭제 (#{checkin.checkinId})
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          체크인은 물리 삭제되어 되돌릴 수 없습니다. 부적절한 방명록 메시지 차단 시 사용하세요.
        </div>

        <div className="mb-4 rounded border border-stroke p-3 text-sm dark:border-strokedark">
          <p className="text-gray-500">글 #{checkin.articleId} · 작성자 #{checkin.userId}</p>
          {checkin.message ? (
            <p className="mt-1 whitespace-pre-wrap text-black dark:text-white">{checkin.message}</p>
          ) : (
            <p className="mt-1 text-gray-400">(방명록 메시지 없음)</p>
          )}
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
