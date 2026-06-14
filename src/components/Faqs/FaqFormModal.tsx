"use client";
import React, { useEffect, useState } from "react";
import { faqsApi } from "@/lib/api/faqs";
import {
  Faq,
  FaqCategory,
  FaqCreatePayload,
  FaqUpdatePayload,
} from "@/types/admin";

interface Props {
  mode: "create" | "edit";
  faq?: Faq | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS: { value: FaqCategory; label: string }[] = [
  { value: "GENERAL", label: "일반" },
  { value: "ACCOUNT", label: "계정" },
  { value: "POINT", label: "포인트" },
  { value: "SPOT", label: "포토스팟" },
  { value: "COMMUNITY", label: "커뮤니티" },
];

export default function FaqFormModal({ mode, faq, onClose, onSuccess }: Props) {
  const isEdit = mode === "edit";
  const [category, setCategory] = useState<FaqCategory>(faq?.category ?? "GENERAL");
  const [question, setQuestion] = useState<string>(faq?.question ?? "");
  const [answer, setAnswer] = useState<string>(faq?.answer ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(faq?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(faq?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    const trimmedQ = question.trim();
    const trimmedA = answer.trim();
    if (!trimmedQ) return setErrorMsg("질문을 입력해주세요.");
    if (trimmedQ.length > 500)
      return setErrorMsg("질문은 500자 이하여야 합니다.");
    if (!trimmedA) return setErrorMsg("답변을 입력해주세요.");
    if (!Number.isFinite(displayOrder) || displayOrder < 0)
      return setErrorMsg("순서는 0 이상의 숫자여야 합니다.");

    const payload: FaqCreatePayload = {
      category,
      question: trimmedQ,
      answer: trimmedA,
      displayOrder,
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit && faq) {
        const update: FaqUpdatePayload = payload;
        await faqsApi.updateFaq(faq.faqId, update);
      } else {
        await faqsApi.createFaq(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-3xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          {isEdit ? "FAQ 수정" : "FAQ 등록"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">카테고리 *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FaqCategory)}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium">순서</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min={0}
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="flex items-end md:col-span-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>활성</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">질문 *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={500}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">{question.length}/500</p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">답변 *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={12}
              required
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          {errorMsg && <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>}

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
