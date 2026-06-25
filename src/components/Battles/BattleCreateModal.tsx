"use client";
import React, { useEffect, useState } from "react";
import { battlesApi } from "@/lib/api/battles";
import { articlesApi } from "@/lib/api/articles";
import { PhotoBattleCreatePayload } from "@/types/admin";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface Preview {
  title: string;
  userId: number;
}

/**
 * 사진 배틀 생성 모달.
 * - articleId 2개 직접 입력 + 입력한 ID의 제목 미리보기(GET /articles/{id}).
 * - spotKey(필수), endAt(datetime-local, 선택 — 미지정 시 서버가 now+72h).
 */
export default function BattleCreateModal({ onClose, onSuccess }: Props) {
  const [articleAId, setArticleAId] = useState("");
  const [articleBId, setArticleBId] = useState("");
  const [spotKey, setSpotKey] = useState("");
  const [endAt, setEndAt] = useState("");
  const [previewA, setPreviewA] = useState<Preview | null>(null);
  const [previewB, setPreviewB] = useState<Preview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const fetchPreview = async (
    idStr: string,
    setPreview: (p: Preview | null) => void,
  ) => {
    const id = Number(idStr);
    if (!idStr.trim() || !Number.isInteger(id) || id <= 0) {
      setPreview(null);
      return;
    }
    try {
      const a = await articlesApi.getArticle(id);
      setPreview({ title: a.title, userId: a.userId });
    } catch {
      setPreview(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const aId = Number(articleAId);
    const bId = Number(articleBId);
    if (!Number.isInteger(aId) || aId <= 0 || !Number.isInteger(bId) || bId <= 0) {
      setErrorMsg("후보 글 ID 두 개를 올바르게 입력해주세요.");
      return;
    }
    if (aId === bId) {
      setErrorMsg("두 후보 글은 서로 달라야 합니다.");
      return;
    }
    const trimmedSpot = spotKey.trim();
    if (trimmedSpot.length === 0) {
      setErrorMsg("스팟 키를 입력해주세요.");
      return;
    }
    if (trimmedSpot.length > 40) {
      setErrorMsg("스팟 키는 40자 이하로 입력해주세요.");
      return;
    }
    if (endAt) {
      const ts = new Date(endAt).getTime();
      if (Number.isNaN(ts) || ts <= Date.now()) {
        setErrorMsg("마감 예정 시각은 현재 이후여야 합니다.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: PhotoBattleCreatePayload = {
        articleAId: aId,
        articleBId: bId,
        spotKey: trimmedSpot,
        endAt: endAt ? `${endAt}:00` : null,
      };
      await battlesApi.create(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "배틀 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">사진 배틀 생성</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              후보 A 글 ID <span className="text-meta-1">*</span>
            </label>
            <input
              type="number"
              value={articleAId}
              onChange={(e) => setArticleAId(e.target.value)}
              onBlur={() => fetchPreview(articleAId, setPreviewA)}
              min={1}
              required
              className={inputCls}
              disabled={submitting}
            />
            {previewA && (
              <p className="mt-1 text-xs text-meta-3">
                ✓ {previewA.title} (작성자 #{previewA.userId})
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              후보 B 글 ID <span className="text-meta-1">*</span>
            </label>
            <input
              type="number"
              value={articleBId}
              onChange={(e) => setArticleBId(e.target.value)}
              onBlur={() => fetchPreview(articleBId, setPreviewB)}
              min={1}
              required
              className={inputCls}
              disabled={submitting}
            />
            {previewB && (
              <p className="mt-1 text-xs text-meta-3">
                ✓ {previewB.title} (작성자 #{previewB.userId})
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              스팟 키 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={spotKey}
              onChange={(e) => setSpotKey(e.target.value)}
              maxLength={40}
              required
              placeholder="예: seoul-forest"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">마감 예정 시각 (선택)</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">미지정 시 생성 시점 +72시간으로 설정됩니다.</p>
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
              type="submit"
              disabled={submitting}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {submitting ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
