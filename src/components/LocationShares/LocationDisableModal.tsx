"use client";
import React, { useState } from "react";
import { locationShareApi, LocationShareDetail } from "@/lib/api/locationShares";

interface Props {
  userId: number;
  userNickname: string;
  onClose: () => void;
  /** 갱신된 상세 DTO를 그대로 부모에 전달 */
  onSuccess: (detail: LocationShareDetail) => void;
}

const REASON_MIN = 10;
const REASON_MAX = 500;

export default function LocationDisableModal({
  userId,
  userNickname,
  onClose,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      const detail = await locationShareApi.forceDisable(userId, reasonTrimmed);
      if (typeof window !== "undefined") {
        window.alert("위치공유가 전역 비활성화되었습니다. 실시간 좌표 캐시도 제거 시도했습니다.");
      }
      onSuccess(detail);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "전역 비활성화에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-sm border-2 border-meta-1 bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-meta-1">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <span>
            <span className="mr-2 inline-flex items-center rounded bg-meta-1/10 px-2 py-0.5 text-xs font-medium text-meta-1">
              위치공유 강제 OFF
            </span>
            &quot;{userNickname}&quot;
          </span>
        </h3>

        <div className="mb-4 rounded border-2 border-meta-1/50 bg-red-50 px-3 py-3 text-sm font-medium text-meta-1 dark:bg-red-900/20">
          <p className="mb-1 font-bold">전역 위치공유를 강제로 끕니다.</p>
          <p>
            이 사용자의 전역 공유 설정이 OFF로 전환되고, 실시간 위치 좌표 캐시 제거를 시도합니다.
            grant(공유 관계)는 삭제하지 않습니다 — 개별 grant 삭제는 grant 테이블에서 진행하세요.
          </p>
        </div>

        <div className="mb-4 rounded border border-stroke bg-gray-1 px-3 py-2 text-xs text-gray-600 dark:border-strokedark dark:bg-meta-4 dark:text-bodydark">
          ℹ️ 이미 보고 있던 화면의 마커는 즉시 사라지지 않을 수 있습니다(서버 푸시 중단 + Redis TTL/키삭제로 수십초~30분 내 소멸).
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
            placeholder="강제 비활성화 사유 (감사 로그에 기록됨). 회원 개인정보(이메일·전화번호)는 입력하지 마세요."
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {reason !== "" && !reasonValid && (
            <p className="mt-1 text-xs text-meta-1">
              사유는 {REASON_MIN}~{REASON_MAX}자 사이여야 합니다.
            </p>
          )}
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            사유에 이메일·전화번호 등 개인정보를 입력하면 서버에서 거부됩니다.
          </p>
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
            className={`rounded bg-meta-1 px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "처리 중..." : "강제 OFF 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
