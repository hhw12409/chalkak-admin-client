"use client";
import React, { useState } from "react";
import { pointsApi } from "@/lib/api/points";

interface Props {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_PATTERN = /01[0-9]-?\d{3,4}-?\d{4}/;

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;
const REASON_MIN = 5;
const REASON_MAX = 200;

export default function PointGrantModal({ userId, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const parsedAmount = Number(amount);
  const amountValid =
    Number.isFinite(parsedAmount) &&
    Number.isInteger(parsedAmount) &&
    parsedAmount >= MIN_AMOUNT &&
    parsedAmount <= MAX_AMOUNT;
  const reasonTrimmed = reason.trim();
  const reasonValid =
    reasonTrimmed.length >= REASON_MIN && reasonTrimmed.length <= REASON_MAX;
  const hasEmail = EMAIL_PATTERN.test(reasonTrimmed);
  const hasPhone = PHONE_PATTERN.test(reasonTrimmed);
  const piiDetected = hasEmail || hasPhone;

  const canSubmit = amountValid && reasonValid && !piiDetected && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `회원 #${userId}에게 ${parsedAmount.toLocaleString()}P 적립합니다.\n사유: ${reasonTrimmed}`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await pointsApi.grantUserPoint(userId, {
        amount: parsedAmount,
        reason: reasonTrimmed,
      });
      if (typeof window !== "undefined") {
        window.alert(`${parsedAmount.toLocaleString()}P 적립이 완료되었습니다.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "적립에 실패했습니다.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-3">
          <span className="mr-2 inline-flex items-center rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
            적립
          </span>
          포인트 수동 적립 &mdash; 회원 #{userId}
        </h3>

        <div className="mb-4 rounded border border-meta-6/30 bg-yellow-50 px-3 py-2 text-xs text-meta-6 dark:bg-meta-6/10">
          사유에 이메일·전화번호 등 개인정보를 입력하지 마세요. CS 티켓 번호나
          일반 설명만 입력하세요.
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            적립 금액 (P) *
          </label>
          <input
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`${MIN_AMOUNT} ~ ${MAX_AMOUNT.toLocaleString()}`}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {amount !== "" && !amountValid && (
            <p className="mt-1 text-xs text-meta-1">
              {MIN_AMOUNT} 이상 {MAX_AMOUNT.toLocaleString()} 이하 정수만 입력
              가능합니다.
            </p>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">
              사유 * ({REASON_MIN}~{REASON_MAX}자)
            </label>
            <span
              className={`text-xs ${
                reasonTrimmed.length > REASON_MAX
                  ? "text-meta-1"
                  : "text-gray-500"
              }`}
            >
              {reasonTrimmed.length} / {REASON_MAX}
            </span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="예: CS 티켓 #1234 — 미적립 건 수동 처리"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {reason !== "" && !reasonValid && (
            <p className="mt-1 text-xs text-meta-1">
              사유는 {REASON_MIN}~{REASON_MAX}자 사이여야 합니다.
            </p>
          )}
          {piiDetected && (
            <p className="mt-1 text-xs text-meta-1">
              {hasEmail && "이메일 패턴이 감지되었습니다. "}
              {hasPhone && "전화번호 패턴이 감지되었습니다. "}
              개인정보는 입력할 수 없습니다.
            </p>
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
            className={`rounded bg-meta-3 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "적립 중..." : "적립"}
          </button>
        </div>
      </div>
    </div>
  );
}
