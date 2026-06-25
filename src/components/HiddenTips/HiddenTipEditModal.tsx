"use client";
import React, { useEffect, useState } from "react";
import { hiddenTipsApi } from "@/lib/api/hiddenTips";
import { HiddenTip, HiddenTipUpdatePayload } from "@/types/admin";

interface Props {
  tip: HiddenTip;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 히든팁 수정 모달. title/content/spotLabel 정정.
 * - title/content 빈값 거부(서버도 INVALID_PARAMETER).
 */
export default function HiddenTipEditModal({ tip, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(tip.title);
  const [content, setContent] = useState(tip.content);
  const [spotLabel, setSpotLabel] = useState(tip.spotLabel ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (trimmedTitle.length === 0) {
      setErrorMsg("제목을 입력해주세요.");
      return;
    }
    if (trimmedContent.length === 0) {
      setErrorMsg("내용을 입력해주세요.");
      return;
    }

    const payload: HiddenTipUpdatePayload = {};
    if (trimmedTitle !== tip.title) payload.title = trimmedTitle;
    if (trimmedContent !== tip.content) payload.content = trimmedContent;
    const normalizedLabel = spotLabel.trim() || null;
    if (normalizedLabel !== (tip.spotLabel ?? null)) payload.spotLabel = normalizedLabel;

    if (Object.keys(payload).length === 0) {
      setErrorMsg("변경된 내용이 없습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await hiddenTipsApi.update(tip.tipId, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
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
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          히든팁 수정 (#{tip.tipId})
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              제목 <span className="text-meta-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              내용 <span className="text-meta-1">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
              required
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">스팟 라벨</label>
            <input
              type="text"
              value={spotLabel}
              onChange={(e) => setSpotLabel(e.target.value)}
              maxLength={100}
              placeholder="예: ○○ 다리 밑"
              className={inputCls}
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
