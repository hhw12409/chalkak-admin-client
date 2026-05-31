"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/users";
import { AdminUser, PageResponse } from "@/types/admin";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "탈퇴",
  SUSPENDED: "정지",
};

export default function UserListClient() {
  const router = useRouter();
  const [data, setData] = useState<PageResponse<AdminUser> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, kw: string, st: string) => {
    setLoading(true);
    usersApi
      .getUsers({ page: p, size: 20, keyword: kw || undefined, status: st || undefined })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, keyword, status);
  }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, status);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">사용자 관리</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="닉네임·이메일 검색"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="DELETED">탈퇴</option>
          <option value="SUSPENDED">정지</option>
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">ID</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">닉네임</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">상태</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">가입일</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">사용자가 없습니다</td></tr>
              ) : (
                data?.content.map((user) => (
                  <tr key={user.userId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.userId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{user.nickname}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        user.status === 'ACTIVE' ? 'bg-meta-3/10 text-meta-3' :
                        user.status === 'DELETED' ? 'bg-meta-5/10 text-meta-5' : 'bg-meta-6/10 text-meta-6'
                      }`}>
                        {statusLabel[user.status] ?? user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/users/${user.userId}`)}
                        className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-opacity-90"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-3 dark:border-strokedark">
            <span className="text-sm text-gray-500">
              {page + 1} / {data.totalPages} 페이지 (총 {data.totalElements}명)
            </span>
            <div className="flex gap-2">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >
                이전
              </button>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
