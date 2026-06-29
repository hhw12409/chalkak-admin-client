"use client";
import React, { useEffect, useState } from "react";
import { geoQuizApi } from "@/lib/api/geoQuiz";
import { GeoQuizPlay, GeoQuizPlayDetail } from "@/types/admin";

interface Props {
  playId: number;
  isAdmin: boolean;
  onClose: () => void;
  onRequestScore: (play: GeoQuizPlay) => void;
  onRequestDelete: (play: GeoQuizPlay) => void;
}

/**
 * 플레이 상세 모달.
 * - play 요약 + 문항별 guess(추측 좌표/거리/점수) 테이블.
 * - ADMIN 은 점수 정정/삭제 진입 버튼 노출.
 */
export default function GeoQuizPlayDetailModal({
  playId,
  isAdmin,
  onClose,
  onRequestScore,
  onRequestDelete,
}: Props) {
  const [detail, setDetail] = useState<GeoQuizPlayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    geoQuizApi
      .getPlay(playId)
      .then((res) => {
        setDetail(res);
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "상세를 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  }, [playId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            플레이 상세 #{playId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black dark:hover:text-white"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

        {loading || !detail ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 rounded border border-stroke p-4 text-sm dark:border-strokedark sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">유저</p>
                <p className="font-medium text-black dark:text-white">#{detail.userId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">플레이 날짜</p>
                <p className="font-medium text-black dark:text-white">{detail.playDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">총점</p>
                <p className="font-medium text-black dark:text-white">
                  {detail.totalScore.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">문항 수</p>
                <p className="font-medium text-black dark:text-white">{detail.questionCount}</p>
              </div>
            </div>

            <h4 className="mb-2 text-sm font-semibold text-black dark:text-white">
              문항별 추측 ({detail.guesses.length})
            </h4>
            <div className="overflow-x-auto rounded border border-stroke dark:border-strokedark">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                    <th className="px-3 py-2 text-left font-medium">순번</th>
                    <th className="px-3 py-2 text-left font-medium">글 ID</th>
                    <th className="px-3 py-2 text-left font-medium">추측 좌표</th>
                    <th className="px-3 py-2 text-right font-medium">거리</th>
                    <th className="px-3 py-2 text-right font-medium">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.guesses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                        문항 기록이 없습니다
                      </td>
                    </tr>
                  ) : (
                    detail.guesses.map((g) => (
                      <tr
                        key={g.guessId}
                        className="border-b border-stroke last:border-0 dark:border-strokedark"
                      >
                        <td className="px-3 py-2 text-gray-500">{g.questionOrder}</td>
                        <td className="px-3 py-2 text-gray-500">#{g.articleId}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                          {g.guessLat.toFixed(4)}, {g.guessLng.toFixed(4)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-500">
                          {g.distanceMeters >= 1000
                            ? `${(g.distanceMeters / 1000).toFixed(2)}km`
                            : `${Math.round(g.distanceMeters)}m`}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-black dark:text-white">
                          {g.score.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isAdmin && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => onRequestScore(detail)}
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  점수 정정
                </button>
                <button
                  onClick={() => onRequestDelete(detail)}
                  className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  삭제
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
