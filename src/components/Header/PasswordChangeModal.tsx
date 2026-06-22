"use client";
import React, { useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";

interface Props {
  onClose: () => void;
}

/**
 * 운영자 본인 비밀번호 변경 모달.
 * - 현재/신규/신규확인 3개 입력
 * - 신규는 8~64자, 신규=신규확인 일치 검증 (클라이언트)
 * - 현재 비밀번호 검증·동일 비밀번호 거부는 서버에서 처리
 */
export default function PasswordChangeModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

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

    if (!currentPassword) {
      setErrorMsg("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 64) {
      setErrorMsg("새 비밀번호는 8자 이상 64자 이하로 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("새 비밀번호와 확인이 일치하지 않습니다.");
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMsg("현재 비밀번호와 다른 비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          비밀번호 변경
        </h3>

        {success ? (
          <div>
            <div className="mb-4 rounded border border-meta-3/30 bg-green-50 px-3 py-2 text-sm text-meta-3 dark:bg-meta-3/10">
              비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해주세요.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                현재 비밀번호 <span className="text-meta-1">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                disabled={submitting}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                새 비밀번호 <span className="text-meta-1">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={64}
                required
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                8자 이상 64자 이하. ({newPassword.length}/64)
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                새 비밀번호 확인 <span className="text-meta-1">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
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
                type="submit"
                disabled={submitting}
                className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
              >
                {submitting ? "변경 중..." : "변경"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
