"use client";
import React, { useEffect, useState } from "react";
import { pointsApi } from "@/lib/api/points";
import {
  PointBalance,
  PointHistoryItem,
  PointSource,
} from "@/types/admin";
import PointGrantModal from "@/components/Users/PointGrantModal";
import PointRevokeModal from "@/components/Users/PointRevokeModal";

interface Props {
  userId: number;
  /** ADMIN 역할이면 true. false면 적립/차감 버튼 미노출. */
  canGrant: boolean;
}

const HISTORY_PAGE_SIZE = 20;

const sourceLabelMap: Record<PointSource, string> = {
  ATTENDANCE: "출석체크",
  MISSION_CLAIM: "미션 보상",
  STREAK_BONUS: "연속 출석",
  ADMIN_GRANT: "관리자 적립",
  ADMIN_REVOKE: "관리자 차감",
};

function formatDateTime(iso: string): string {
  // "2026-06-14T10:23:11" 또는 ISO+Z 형태 → "2026-06-14 10:23"
  if (!iso) return "-";
  const cleaned = iso.replace("T", " ");
  return cleaned.slice(0, 16);
}

export default function UserPointSection({ userId, canGrant }: Props) {
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");

  const [items, setItems] = useState<PointHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const loadBalance = () => {
    setBalanceLoading(true);
    setBalanceError("");
    pointsApi
      .getUserPointBalance(userId)
      .then(setBalance)
      .catch((e) =>
        setBalanceError(
          e instanceof Error ? e.message : "잔액을 불러오지 못했습니다.",
        ),
      )
      .finally(() => setBalanceLoading(false));
  };

  const loadHistoryInitial = () => {
    setHistoryLoading(true);
    setHistoryError("");
    pointsApi
      .getUserPointHistory(userId, { size: HISTORY_PAGE_SIZE })
      .then((page) => {
        setItems(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      })
      .catch((e) =>
        setHistoryError(
          e instanceof Error ? e.message : "이력을 불러오지 못했습니다.",
        ),
      )
      .finally(() => setHistoryLoading(false));
  };

  const loadMore = () => {
    if (!hasMore || nextCursor == null || loadingMore) return;
    setLoadingMore(true);
    pointsApi
      .getUserPointHistory(userId, {
        lastId: nextCursor,
        size: HISTORY_PAGE_SIZE,
      })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      })
      .catch((e) =>
        setHistoryError(
          e instanceof Error ? e.message : "추가 이력을 불러오지 못했습니다.",
        ),
      )
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    loadBalance();
    loadHistoryInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleMutationSuccess = () => {
    loadBalance();
    loadHistoryInitial();
  };

  const renderAmount = (it: PointHistoryItem) => {
    const sign = it.pointType === "EARN" ? "+" : "-";
    const cls =
      it.pointType === "EARN" ? "text-meta-3" : "text-meta-1";
    return (
      <span className={`font-semibold ${cls}`}>
        {sign}
        {it.amount.toLocaleString()}
      </span>
    );
  };

  return (
    <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h2 className="font-semibold text-black dark:text-white">포인트</h2>
        {canGrant && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGrantModal(true)}
              disabled={balanceLoading}
              className="rounded bg-meta-3 px-3 py-1 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              + 수동 적립
            </button>
            <button
              type="button"
              onClick={() => setShowRevokeModal(true)}
              disabled={balanceLoading || !balance || balance.balance <= 0}
              className="rounded bg-meta-1 px-3 py-1 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              - 수동 차감
            </button>
          </div>
        )}
      </div>

      {/* 잔액 카드 */}
      <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
        {balanceLoading ? (
          <div className="text-sm text-gray-400">잔액 불러오는 중...</div>
        ) : balanceError ? (
          <div className="text-sm text-meta-1">{balanceError}</div>
        ) : balance ? (
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <span className="text-xs text-gray-500">현재 잔액</span>
              <p className="text-2xl font-bold text-black dark:text-white">
                {balance.balance.toLocaleString()}{" "}
                <span className="text-base font-medium text-gray-500">P</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">최근 갱신</span>
              <p className="text-sm text-black dark:text-white">
                {balance.lastUpdatedAt
                  ? formatDateTime(balance.lastUpdatedAt)
                  : "-"}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* 이력 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 text-left font-medium">일시</th>
              <th className="px-4 py-3 text-left font-medium">구분</th>
              <th className="px-4 py-3 text-right font-medium">변동량</th>
              <th className="px-4 py-3 text-right font-medium">잔액 후</th>
              <th className="px-4 py-3 text-left font-medium">사유</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : historyError ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-meta-1"
                >
                  {historyError}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  포인트 이력이 없습니다
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.historyId}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(it.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-meta-4 dark:text-bodydark">
                      {it.sourceLabel ?? sourceLabelMap[it.source] ?? it.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{renderAmount(it)}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-bodydark">
                    {it.balanceAfter.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span
                      className="line-clamp-2 text-gray-600 dark:text-bodydark"
                      title={it.reason ?? undefined}
                    >
                      {it.reason ?? "-"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !historyLoading && !historyError && (
        <div className="flex justify-center border-t border-stroke px-6 py-3 dark:border-strokedark">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded border border-stroke px-4 py-1.5 text-sm hover:bg-gray-1 disabled:opacity-60 dark:border-strokedark dark:hover:bg-meta-4"
          >
            {loadingMore ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}

      {showGrantModal && (
        <PointGrantModal
          userId={userId}
          onClose={() => setShowGrantModal(false)}
          onSuccess={handleMutationSuccess}
        />
      )}
      {showRevokeModal && balance && (
        <PointRevokeModal
          userId={userId}
          currentBalance={balance.balance}
          onClose={() => setShowRevokeModal(false)}
          onSuccess={handleMutationSuccess}
        />
      )}
    </div>
  );
}
