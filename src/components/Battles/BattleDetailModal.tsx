"use client";
import React, { useEffect, useState } from "react";
import { battlesApi } from "@/lib/api/battles";
import { PhotoBattleCandidate, PhotoBattleDetail } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

interface Props {
  battleId: number;
  onClose: () => void;
  /** 마감/연장/삭제 등 변경 후 목록 갱신용 */
  onChanged: () => void;
}

/**
 * 사진 배틀 상세 모달.
 * - 후보 A/B 카드(제목·작성자·득표수·득표율 바).
 * - [마감]/[연장] OPERATOR↑ (status=OPEN 일 때만), [삭제] ADMIN.
 */
export default function BattleDetailModal({ battleId, onClose, onChanged }: Props) {
  const { admin } = useAuth();
  const isOperatorOrAbove = admin?.role === "OPERATOR" || admin?.role === "ADMIN";
  const isAdmin = admin?.role === "ADMIN";

  const [detail, setDetail] = useState<PhotoBattleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extendAt, setExtendAt] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const d = await battlesApi.get(battleId);
      setDetail(d);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "배틀 상세를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId]);

  const handleClose = async () => {
    setBusy(true);
    try {
      await battlesApi.close(battleId);
      await loadDetail();
      onChanged();
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "마감 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleExtend = async () => {
    if (!extendAt) return;
    const ts = new Date(extendAt).getTime();
    if (Number.isNaN(ts) || ts <= Date.now()) {
      window.alert("연장 시각은 현재 이후여야 합니다.");
      return;
    }
    setBusy(true);
    try {
      await battlesApi.extend(battleId, `${extendAt}:00`);
      setShowExtend(false);
      setExtendAt("");
      await loadDetail();
      onChanged();
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "연장 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await battlesApi.remove(battleId);
      window.alert("삭제되었습니다");
      onChanged();
      onClose();
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            배틀 상세 {detail && `#${detail.battleId}`}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : error ? (
          <div className="rounded border border-meta-1/30 bg-red-50 p-4 text-sm text-meta-1 dark:bg-meta-1/10">
            {error}
          </div>
        ) : detail ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">스팟 키:</span> {detail.spotKey}
              </p>
              <p>
                <span className="font-medium">상태:</span>{" "}
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                    detail.status === "OPEN"
                      ? "bg-meta-3/10 text-meta-3"
                      : "bg-meta-5/10 text-meta-5"
                  }`}
                >
                  {detail.status}
                </span>
              </p>
              <p>
                <span className="font-medium">마감 예정:</span>{" "}
                {detail.endAt?.slice(0, 16).replace("T", " ")}
              </p>
              <p>
                <span className="font-medium">총 투표수:</span> {detail.totalVotes}
              </p>
              <p className="col-span-2">
                <span className="font-medium">생성일:</span>{" "}
                {detail.createdAt?.slice(0, 16).replace("T", " ")}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <CandidateCard
                label="후보 A"
                candidate={detail.candidateA}
                totalVotes={detail.totalVotes}
              />
              <CandidateCard
                label="후보 B"
                candidate={detail.candidateB}
                totalVotes={detail.totalVotes}
              />
            </div>

            {showExtend && (
              <div className="mb-4 rounded border border-stroke p-3 dark:border-strokedark">
                <label className="mb-1 block text-sm font-medium">새 마감 예정 시각</label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={extendAt}
                    onChange={(e) => setExtendAt(e.target.value)}
                    className="flex-1 rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                  <button
                    onClick={handleExtend}
                    disabled={busy || !extendAt}
                    className="rounded bg-primary px-3 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                  >
                    연장 적용
                  </button>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="mb-4 rounded border border-meta-1/30 bg-red-50 p-3 text-sm text-meta-1 dark:bg-meta-1/10">
                부정 배틀을 물리 삭제합니다. 투표 기록도 함께 삭제되며 되돌릴 수 없습니다.
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="rounded bg-meta-1 px-3 py-1.5 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                  >
                    삭제 확정
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={busy}
                    className="rounded border border-stroke px-3 py-1.5 text-xs hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              {isOperatorOrAbove && detail.status === "OPEN" && (
                <>
                  <button
                    onClick={handleClose}
                    disabled={busy}
                    className="rounded bg-meta-5 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                  >
                    마감
                  </button>
                  <button
                    onClick={() => setShowExtend((v) => !v)}
                    disabled={busy}
                    className="rounded bg-meta-6 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                  >
                    연장
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={busy}
                  className="rounded bg-meta-1 px-3 py-1.5 text-sm text-white hover:bg-opacity-90 disabled:opacity-40"
                >
                  삭제
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >
                닫기
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CandidateCard({
  label,
  candidate,
  totalVotes,
}: {
  label: string;
  candidate: PhotoBattleCandidate;
  totalVotes: number;
}) {
  const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
  return (
    <div className="rounded border border-stroke p-3 dark:border-strokedark">
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      <p className="mb-1 font-medium text-black dark:text-white line-clamp-2">
        {candidate.title ?? "(삭제된 글)"}
      </p>
      <p className="mb-2 text-xs text-gray-500">
        글 #{candidate.articleId}
        {candidate.userId != null && ` · 작성자 #${candidate.userId}`}
      </p>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-gray-500">득표 {candidate.voteCount}</span>
        <span className="font-medium text-primary">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-meta-4">
        <div className="h-full rounded bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
