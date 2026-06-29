"use client";
import React, { useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_MAX = 255;

/**
 * 출제 지정(큐레이션 화이트리스트) 등록 모달.
 * - articleId(필수) + 사유(선택, 최대 255자). UNIQUE(article_id)라 중복 등록 시 서버 400.
 * - 적격 지정 글이 1개라도 있으면 출제 풀이 이 목록으로 한정됨(자동 풀 무시, 블록 우선).
 */
export default function GeoQuizFeaturedCreateModal({ onClose, onSuccess }: Props) {
  const [articleId, setArticleId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const parsedId = Number(articleId);
  const idValid =
    articleId.trim() !== "" &&
    Number.isInteger(parsedId) &&
    parsedId > 0;
  const reasonTrimmed = reason.trim();
  const reasonValid = reasonTrimmed.length <= REASON_MAX;
  const canSubmit = idValid && reasonValid && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await geoQuizApi.createFeatured({
        articleId: parsedId,
        reason: reasonTrimmed || undefined,
      });
      if (typeof window !== "undefined") window.alert("출제 지정 목록에 등록되었습니다.");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          출제 지정 등록
        </h3>

        <div className="mb-4 rounded border border-stroke bg-gray-2 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300">
          <span className="font-semibold">적격한 지정 글이 1개라도 있으면</span> 데일리·무한 모드
          출제가 <span className="font-semibold">이 목록 안에서만</span> 진행됩니다(자동 풀 무시).
          출제 제외(블록)된 글은 지정해도 출제되지 않습니다(블록 우선).
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">글 ID (articleId) *</label>
          <input
            type="number"
            min={1}
            step={1}
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            placeholder="예: 1234"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {articleId !== "" && !idValid && (
            <p className="mt-1 text-xs text-meta-1">1 이상의 정수만 입력 가능합니다.</p>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">지정 사유 (선택)</label>
            <span
              className={`text-xs ${
                reasonTrimmed.length > REASON_MAX ? "text-meta-1" : "text-gray-500"
              }`}
            >
              {reasonTrimmed.length} / {REASON_MAX}
            </span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="예: 시즌 큐레이션 / 명소 추천"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
