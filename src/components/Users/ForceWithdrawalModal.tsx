"use client";
import React, { useState } from "react";
import { usersApi } from "@/lib/api/users";

interface Props {
  userId: number;
  userNickname: string;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_MIN = 10;
const REASON_MAX = 500;

export default function ForceWithdrawalModal({
  userId,
  userNickname,
  onClose,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ESC / 오버레이 닫기는 의도적으로 미구현 (실수 닫기 방지)

  const reasonTrimmed = reason.trim();
  const reasonLen = reasonTrimmed.length;
  const reasonValid = reasonLen >= REASON_MIN && reasonLen <= REASON_MAX;
  const nicknameMatch = confirmText === userNickname;
  const canSubmit = reasonValid && nicknameMatch && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await usersApi.forceWithdrawUser(userId, {
        reason: reasonTrimmed,
        confirmNickname: confirmText,
      });
      if (typeof window !== "undefined") {
        window.alert("강제 탈퇴가 완료되었습니다. 회원 정보가 익명화되었습니다.");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "강제 탈퇴에 실패했습니다.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-sm border-2 border-meta-1 bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-meta-1">
          <span className="text-2xl" aria-hidden="true">
            ⚠️
          </span>
          <span>
            <span className="mr-2 inline-flex items-center rounded bg-meta-1/10 px-2 py-0.5 text-xs font-medium text-meta-1">
              강제 탈퇴
            </span>
            &quot;{userNickname}&quot;
          </span>
        </h3>

        <div className="mb-4 rounded border-2 border-meta-1/50 bg-red-50 px-3 py-3 text-sm font-medium text-meta-1 dark:bg-red-900/20">
          <p className="mb-1 font-bold">이 작업은 되돌릴 수 없습니다.</p>
          <p>
            회원 정보(이메일·닉네임·전화번호·프로필 이미지·소개)가 영구히 익명화되고,
            모든 디바이스에서 즉시 로그아웃됩니다. 계정 상태는 <code>DELETED</code>로 전환됩니다.
          </p>
        </div>

        <div className="mb-4 rounded border border-stroke bg-gray-1 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark">
          ℹ️ 현재 발급된 Access Token은 최대 24시간까지 유효할 수 있습니다. 즉시 차단이 필요한 경우 별도 절차가 필요합니다.
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">
              사유 * ({REASON_MIN}~{REASON_MAX}자)
            </label>
            <span
              className={`text-xs ${
                reasonLen > REASON_MAX || (reasonLen > 0 && reasonLen < REASON_MIN)
                  ? "text-meta-1"
                  : "text-gray-500"
              }`}
            >
              {reasonLen} / {REASON_MAX}
            </span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="강제 탈퇴 사유 (감사 로그에 기록됨). 회원 개인정보(이메일·전화번호)는 입력하지 마세요."
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {reason !== "" && !reasonValid && (
            <p className="mt-1 text-xs text-meta-1">
              사유는 {REASON_MIN}~{REASON_MAX}자 사이여야 합니다.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">이중 확인</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`확인을 위해 닉네임 "${userNickname}"을(를) 정확히 입력하세요`}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {confirmText !== "" && !nicknameMatch && (
            <p className="mt-1 text-xs text-meta-1">닉네임이 일치하지 않습니다.</p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-meta-1">{errorMsg}</div>
        )}

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
            className={`rounded bg-meta-1 px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "처리 중..." : "강제 탈퇴 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
