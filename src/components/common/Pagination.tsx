"use client";
import React, { useState } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  let winStart = Math.max(1, current - 2);
  let winEnd = Math.min(total - 2, current + 2);

  // 양 끝에서 항상 5개 이상 보이도록 윈도우 확장
  const winSize = winEnd - winStart + 1;
  if (winSize < 5) {
    const needed = 5 - winSize;
    if (winStart === 1) winEnd = Math.min(total - 2, winEnd + needed);
    else winStart = Math.max(1, winStart - needed);
  }

  const result: (number | "…")[] = [0];
  if (winStart > 1) result.push("…");
  for (let i = winStart; i <= winEnd; i++) result.push(i);
  if (winEnd < total - 2) result.push("…");
  result.push(total - 1);

  return result;
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  first,
  last,
  onPageChange,
  itemLabel = "개",
}: PaginationProps) {
  const [jumpInput, setJumpInput] = useState("");

  const handleJump = () => {
    const target = parseInt(jumpInput, 10) - 1;
    if (!isNaN(target) && target >= 0 && target < totalPages) {
      onPageChange(target);
      setJumpInput("");
    }
  };

  const pageNums = getPageNumbers(page, totalPages);

  const btnBase =
    "flex h-8 min-w-[2rem] items-center justify-center rounded border px-2 text-sm transition-colors disabled:opacity-40";
  const btnNormal =
    "border-stroke bg-white text-gray-600 hover:bg-gray-1 dark:border-strokedark dark:bg-boxdark dark:text-gray-400 dark:hover:bg-meta-4";
  const btnActive =
    "border-primary bg-primary text-white dark:border-primary";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stroke px-4 py-3 dark:border-strokedark">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        총 {totalElements.toLocaleString()}{itemLabel} &nbsp;·&nbsp; {page + 1} / {totalPages} 페이지
      </span>

      <div className="flex flex-wrap items-center gap-1">
        {/* 처음 */}
        <button
          disabled={first}
          onClick={() => onPageChange(0)}
          className={`${btnBase} ${btnNormal}`}
          title="처음 페이지"
        >
          «
        </button>

        {/* 이전 */}
        <button
          disabled={first}
          onClick={() => onPageChange(page - 1)}
          className={`${btnBase} ${btnNormal}`}
          title="이전 페이지"
        >
          ‹
        </button>

        {/* 페이지 번호 */}
        {pageNums.map((n, idx) =>
          n === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 items-center px-1 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`${btnBase} ${n === page ? btnActive : btnNormal}`}
            >
              {n + 1}
            </button>
          ),
        )}

        {/* 다음 */}
        <button
          disabled={last}
          onClick={() => onPageChange(page + 1)}
          className={`${btnBase} ${btnNormal}`}
          title="다음 페이지"
        >
          ›
        </button>

        {/* 끝 */}
        <button
          disabled={last}
          onClick={() => onPageChange(totalPages - 1)}
          className={`${btnBase} ${btnNormal}`}
          title="마지막 페이지"
        >
          »
        </button>

        {/* 페이지 직접 이동 */}
        {totalPages > 7 && (
          <div className="ml-2 flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJump()}
              placeholder="페이지"
              className="h-8 w-16 rounded border border-stroke px-2 text-center text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
            <button
              onClick={handleJump}
              className="h-8 rounded border border-stroke bg-white px-2 text-sm hover:bg-gray-1 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
            >
              이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
