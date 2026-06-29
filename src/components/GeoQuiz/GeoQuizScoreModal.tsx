"use client";
import React, { useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizPlay } from "@/types/admin";

interface Props {
  play: GeoQuizPlay;
  onClose: () => void;
  onSuccess: () => void;
}

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_PATTERN = /01[0-9]-?\d{3,4}-?\d{4}/;

const SCORE_MIN = 0;
const REASON_MIN = 5;
const REASON_MAX = 200;

/**
 * 플레이 점수 정정 모달 (ADMIN 전용).
 * - totalScore(0 이상) + 사유(5~200자, PII 차단). 일일/주간 랭킹은 daily_play 집계라 자연 반영.
 */
export default function GeoQuizScoreModal({ play, onClose, onSuccess }: Props) {
  const [score, setScore] = useState<string>(String(play.totalScore));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const parsedScore = Number(score);
  const scoreValid =
    score.trim() !== "" &&
    Number.isInteger(parsedScore) &&
    parsedScore >= SCORE_MIN;

  const reasonTrimmed = reason.trim();
  const reasonValid =
    reasonTrimmed.length >= REASON_MIN && reasonTrimmed.length <= REASON_MAX;
  const hasEmail = EMAIL_PATTERN.test(reasonTrimmed);
  const hasPhone = PHONE_PATTERN.test(reasonTrimmed);
  const piiDetected = hasEmail || hasPhone;

  const canSubmit = scoreValid && reasonValid && !piiDetected && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await geoQuizApi.updatePlayScore(play.playId, {
        totalScore: parsedScore,
        reason: reasonTrimmed,
      });
      if (typeof window !== "undefined") window.alert("점수를 정정했습니다.");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "점수 정정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          점수 정정 — 플레이 #{play.playId}
        </h3>

        <div className="mb-4 rounded border border-stroke bg-gray-1 px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4">
          <span className="text-gray-500">현재 총점</span>
          <span className="ml-2 font-semibold text-black dark:text-white">
            {play.totalScore.toLocaleString()}
          </span>
          <span className="ml-3 text-gray-500">
            (유저 #{play.userId} · {play.playDate})
          </span>
        </div>

        <div className="mb-4 rounded border border-meta-6/30 bg-yellow-50 px-3 py-2 text-xs text-meta-6 dark:bg-meta-6/10">
          사유에 이메일·전화번호 등 개인정보를 입력하지 마세요. 일일/주간 랭킹은 정정 후
          캐시 TTL(약 10분) 뒤 갱신됩니다.
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">정정 총점 *</label>
          <input
            type="number"
            min={SCORE_MIN}
            step={1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
          {score !== "" && !scoreValid && (
            <p className="mt-1 text-xs text-meta-1">0 이상의 정수만 입력 가능합니다.</p>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">
              사유 * ({REASON_MIN}~{REASON_MAX}자)
            </label>
            <span
              className={`text-xs ${
                reasonTrimmed.length > REASON_MAX ? "text-meta-1" : "text-gray-500"
              }`}
            >
              {reasonTrimmed.length} / {REASON_MAX}
            </span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="예: 좌표 오류 문항 보정 — CS-1234"
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
            className={`rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "정정 중..." : "정정"}
          </button>
        </div>
      </div>
    </div>
  );
}
