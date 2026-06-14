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

export default function ForceLogoutModal({
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
      await usersApi.forceLogoutUser(userId, { reason: reasonTrimmed });
      if (typeof window !== "undefined") {
        window.alert("강제 로그아웃이 완료되었습니다. 모든 디바이스에서 로그아웃되었습니다.");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "강제 로그아웃에 실패했습니다.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-6">
          <span className="mr-2 inline-flex items-center rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">
            강제 로그아웃
          </span>
          &quot;{userNickname}&quot;
        </h3>

        <div className="mb-4 rounded border border-meta-6/30 bg-yellow-50 px-3 py-2 text-sm text-meta-6 dark:bg-meta-6/10">
          선택한 회원의 모든 디바이스에서 즉시 로그아웃됩니다. 계정 자체는 유지되며, 본인은 다시 로그인할 수 있습니다.
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
            placeholder="강제 로그아웃 사유 (감사 로그에 기록됨)"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {reason !== "" && !reasonValid && (
            <p className="mt-1 text-xs text-meta-1">
              사유는 {REASON_MIN}~{REASON_MAX}자 사이여야 합니다.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            이중 확인 <span className="text-xs font-normal text-gray-500">(운영 실수 방지용 — 서버 전송 X)</span>
          </label>
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
            className={`rounded bg-meta-6 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "실행 중..." : "강제 로그아웃 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
