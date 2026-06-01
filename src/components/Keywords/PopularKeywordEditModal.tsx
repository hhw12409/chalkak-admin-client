"use client";
import React, { useEffect, useState } from "react";
import { keywordsApi } from "@/lib/api/keywords";
import { PopularKeyword, PopularKeywordUpdatePayload } from "@/types/admin";

interface Props {
  keyword: PopularKeyword;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PopularKeywordEditModal({ keyword, onClose, onSuccess }: Props) {
  const [keywordValue, setKeywordValue] = useState<string>(keyword.keyword);
  const [rankValue, setRankValue] = useState<number>(keyword.rank);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmed = keywordValue.trim();
    if (trimmed.length === 0) {
      setErrorMsg("키워드를 입력해주세요.");
      return;
    }
    if (trimmed.length > 200) {
      setErrorMsg("키워드는 200자 이하여야 합니다.");
      return;
    }
    if (!Number.isFinite(rankValue) || rankValue < 1) {
      setErrorMsg("순위는 1 이상의 숫자여야 합니다.");
      return;
    }

    const payload: PopularKeywordUpdatePayload = {};
    if (trimmed !== keyword.keyword) payload.keyword = trimmed;
    if (rankValue !== keyword.rank) payload.rank = rankValue;

    if (payload.keyword === undefined && payload.rank === undefined) {
      setErrorMsg("변경된 내용이 없습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await keywordsApi.updatePopularKeyword(keyword.popularKeywordId, payload);
      setSuccessMsg("수정되었습니다");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          인기검색어 수정
        </h3>

        <div className="mb-4 rounded border border-stroke bg-gray-2 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300">
          수정은 다음 정시 배치(매시 0분)까지만 유효합니다.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">키워드</label>
            <input
              type="text"
              value={keywordValue}
              onChange={(e) => setKeywordValue(e.target.value)}
              maxLength={200}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">좌우 공백은 자동으로 제거됩니다. 최대 200자.</p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">순위</label>
            <input
              type="number"
              value={rankValue}
              onChange={(e) => setRankValue(Number(e.target.value))}
              min={1}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">동일 순위가 이미 있으면 자동으로 교환됩니다.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="mb-4 text-sm text-meta-3">{successMsg}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
