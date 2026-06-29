"use client";
import React, { useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizPlay } from "@/types/admin";

interface Props {
  play: GeoQuizPlay;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_MAX = 200;

/**
 * 플레이 데이터 삭제 모달 (ADMIN 전용, 이중확인).
 * - guess 선삭제 후 play 물리 삭제(되돌릴 수 없음). 확인 입력으로 오삭제 방지.
 */
export default function GeoQuizPlayDeleteModal({ play, onClose, onSuccess }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const confirmWord = String(play.playId);
  const confirmed = confirmText.trim() === confirmWord;
  const reasonTrimmed = reason.trim();
  const reasonValid = reasonTrimmed.length <= REASON_MAX;
  const canSubmit = confirmed && reasonValid && !submitting;

  const handleDelete = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await geoQuizApi.removePlay(play.playId, reasonTrimmed || undefined);
      if (typeof window !== "undefined") window.alert("플레이 데이터를 삭제했습니다.");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      if (message.includes("찾을 수 없습니다")) {
        if (typeof window !== "undefined") window.alert("이미 삭제된 항목입니다.");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-meta-1">
          플레이 삭제 (#{play.playId})
        </h3>

        <div className="mb-4 rounded border border-meta-1/30 bg-red-50 px-3 py-2 text-sm text-meta-1 dark:bg-meta-1/10">
          플레이와 모든 문항(guess)이 물리 삭제되어 되돌릴 수 없습니다. 일일/주간 랭킹에서도
          제외됩니다.
        </div>

        <div className="mb-4 rounded border border-stroke p-3 text-sm dark:border-strokedark">
          <p className="text-gray-500">
            유저 #{play.userId} · {play.playDate} · 총점{" "}
            {play.totalScore.toLocaleString()} · 문항 {play.questionCount}개
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            삭제 확인을 위해{" "}
            <span className="font-mono text-meta-1">{confirmWord}</span> 를 입력하세요 *
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">삭제 사유 (선택)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="예: 어뷰징 플레이 제거 — CS-1234"
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
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
            type="button"
            onClick={handleDelete}
            disabled={!canSubmit}
            className={`rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {submitting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
