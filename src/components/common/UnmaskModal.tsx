"use client";
import React, { useEffect, useState } from "react";
import { unmaskApi, UnmaskTargetType } from "@/lib/api/unmask";

interface UnmaskModalProps {
  targetType: UnmaskTargetType;
  targetId: number;
  fieldLabel: string;
  onClose: () => void;
  onSuccess: (expiresAt: string | null) => void;
}

export default function UnmaskModal({
  targetType,
  targetId,
  fieldLabel,
  onClose,
  onSuccess,
}: UnmaskModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("열람 사유는 최소 5자 이상 입력해주세요.");
      return;
    }
    if (trimmed.length > 500) {
      setError("열람 사유는 500자 이내로 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await unmaskApi.createGrant({
        targetType,
        targetId,
        reason: trimmed,
      });
      // ADM-C-QA-003: 이미 활성 권한이 있는 경우 사용자에게 명확히 안내
      if (result.alreadyGranted) {
        window.alert("이미 활성 권한이 있어 추가 발급 없이 그대로 열람합니다.");
      }
      onSuccess(result.expiresAt);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
          개인정보 열람 승인 요청
        </h3>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {fieldLabel} 정보를 1시간 동안 열람합니다. 목적 외 사용은 금지됩니다.
        </p>
        <p className="mb-4 text-xs text-amber-600 dark:text-amber-400">
          사유에 이메일·전화번호 등 개인정보를 직접 입력하지 마세요.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              열람 사유 *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={5}
              maxLength={500}
              required
              rows={4}
              placeholder="열람 사유를 입력하세요 (최소 5자)"
              className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-400">{reason.length}/500</p>
          </div>
          {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-stroke bg-white px-4 py-2 text-sm text-black hover:bg-gray-1 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {submitting ? "처리 중..." : "열람 승인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
