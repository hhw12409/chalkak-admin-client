"use client";
import React, { useMemo, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizFeaturedBulkResult } from "@/types/admin";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_MAX = 255;
const MAX_ITEMS = 200;

/**
 * 출제 지정(큐레이션 화이트리스트) 일괄 등록 모달.
 * - 글 ID 여러 개를 쉼표/공백/줄바꿈으로 구분해 입력 → bulk 등록(공통 사유 1개를 각 항목에 적용).
 * - UNIQUE(article_id)라 이미 등록된 글은 서버가 멱등 skip, 그 외 오류는 failed 로 분류(부분 실패 허용).
 * - 적격 지정 글이 1개라도 있으면 출제 풀이 이 목록으로 한정됨(자동 풀 무시, 블록 우선).
 */
export default function GeoQuizFeaturedCreateModal({ onClose, onSuccess }: Props) {
  const [idsRaw, setIdsRaw] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<GeoQuizFeaturedBulkResult | null>(null);

  // 쉼표·공백·줄바꿈 등 비숫자 구분자로 토큰화 → 양수 정수만 채택, 중복 제거.
  const { ids, invalidTokens } = useMemo(() => {
    const tokens = idsRaw.split(/[^0-9]+/).filter((t) => t.trim() !== "");
    const valid: number[] = [];
    const invalid: string[] = [];
    const seen = new Set<number>();
    for (const t of tokens) {
      const n = Number(t);
      if (Number.isInteger(n) && n > 0) {
        if (!seen.has(n)) {
          seen.add(n);
          valid.push(n);
        }
      } else {
        invalid.push(t);
      }
    }
    return { ids: valid, invalidTokens: invalid };
  }, [idsRaw]);

  const reasonTrimmed = reason.trim();
  const reasonValid = reasonTrimmed.length <= REASON_MAX;
  const tooMany = ids.length > MAX_ITEMS;
  const canSubmit =
    ids.length > 0 && !tooMany && reasonValid && !submitting && !result;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      const res = await geoQuizApi.createFeaturedBulk({
        items: ids.map((articleId) => ({
          articleId,
          reason: reasonTrimmed || undefined,
        })),
      });
      setResult(res);
      // 하나라도 등록됐으면 부모 목록 갱신.
      if (res.created > 0) onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          출제 지정 일괄 등록
        </h3>

        {result ? (
          // ── 결과 요약 화면 ─────────────────────────────
          <div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded border border-stroke px-2 py-3 dark:border-strokedark">
                <p className="text-2xl font-bold text-meta-3">{result.created}</p>
                <p className="mt-1 text-xs text-gray-500">등록</p>
              </div>
              <div className="rounded border border-stroke px-2 py-3 dark:border-strokedark">
                <p className="text-2xl font-bold text-gray-500">{result.skipped}</p>
                <p className="mt-1 text-xs text-gray-500">이미 등록</p>
              </div>
              <div className="rounded border border-stroke px-2 py-3 dark:border-strokedark">
                <p
                  className={`text-2xl font-bold ${
                    result.failed > 0 ? "text-meta-1" : "text-gray-500"
                  }`}
                >
                  {result.failed}
                </p>
                <p className="mt-1 text-xs text-gray-500">실패</p>
              </div>
            </div>

            <p className="mb-3 text-xs text-gray-500">
              요청 {result.requested}건 처리 완료
            </p>

            {result.skippedArticleIds.length > 0 && (
              <div className="mb-3 rounded border border-stroke bg-gray-2 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300">
                <span className="font-semibold">이미 등록(skip):</span>{" "}
                {result.skippedArticleIds.map((id) => `#${id}`).join(", ")}
              </div>
            )}

            {result.failedItems.length > 0 && (
              <div className="mb-3 rounded border border-meta-1/40 bg-meta-1/5 px-3 py-2 text-xs text-meta-1">
                <p className="mb-1 font-semibold">실패 항목</p>
                <ul className="space-y-1">
                  {result.failedItems.map((f, i) => (
                    <li key={i}>
                      {f.articleId != null ? `#${f.articleId}` : "(ID 없음)"} —{" "}
                      {f.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          // ── 입력 화면 ─────────────────────────────────
          <div>
            <div className="mb-4 rounded border border-stroke bg-gray-2 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300">
              <span className="font-semibold">적격한 지정 글이 1개라도 있으면</span> 데일리·무한 모드
              출제가 <span className="font-semibold">이 목록 안에서만</span> 진행됩니다(자동 풀 무시).
              출제 제외(블록)된 글은 지정해도 출제되지 않습니다(블록 우선).
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium">
                  글 ID 목록 (articleId) *
                </label>
                <span
                  className={`text-xs ${
                    tooMany ? "text-meta-1" : "text-gray-500"
                  }`}
                >
                  {ids.length} / {MAX_ITEMS}
                </span>
              </div>
              <textarea
                value={idsRaw}
                onChange={(e) => setIdsRaw(e.target.value)}
                rows={4}
                placeholder="쉼표·공백·줄바꿈으로 구분해 여러 개 입력&#10;예: 1234, 5678 9012"
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                쉼표·공백·줄바꿈으로 구분합니다. 중복 ID는 자동 제거됩니다.
              </p>
              {invalidTokens.length > 0 && (
                <p className="mt-1 text-xs text-meta-1">
                  무시된 잘못된 값: {invalidTokens.slice(0, 10).join(", ")}
                  {invalidTokens.length > 10 ? " …" : ""}
                </p>
              )}
              {tooMany && (
                <p className="mt-1 text-xs text-meta-1">
                  한 번에 최대 {MAX_ITEMS}건까지 등록할 수 있습니다.
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium">지정 사유 (선택, 공통 적용)</label>
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
                rows={2}
                placeholder="예: 시즌 큐레이션 / 명소 추천 (모든 글에 동일 적용)"
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
                {submitting ? "등록 중..." : `${ids.length || ""} 건 등록`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
