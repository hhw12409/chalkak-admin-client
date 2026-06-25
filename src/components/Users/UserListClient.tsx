"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/users";
import { AdminUser, PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";
import MaskedField from "@/components/common/MaskedField";
import UnmaskModal from "@/components/common/UnmaskModal";
import CsvExportButton from "@/components/common/CsvExportButton";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "탈퇴",
  SUSPENDED: "정지",
};

const roleLabel: Record<string, string> = {
  USER: "일반",
  ADMIN: "관리자",
};

const snsTypeLabel: Record<string, string> = {
  KAKAO: "카카오",
  NAVER: "네이버",
  APPLE: "애플",
  GOOGLE: "구글",
};

export default function UserListClient() {
  const router = useRouter();
  const [data, setData] = useState<PageResponse<AdminUser> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unmaskTargetId, setUnmaskTargetId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const load = (p: number, kw: string, st: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    usersApi
      .getUsers({ page: p, size: 20, keyword: kw || undefined, status: st || undefined })
      .then((res) => { if (reqId === reqIdRef.current) setData(res); })
      .catch((e) => { if (reqId === reqIdRef.current) setError(e.message); })
      .finally(() => { if (reqId === reqIdRef.current) setLoading(false); });
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
        <CsvExportButton
          exportPath="/users/export"
          requiredRole="ADMIN"
          label="회원 CSV"
          fallbackFilename="chalkak_admin_users.csv"
          filterParams={{ status, keyword }}
        />
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
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">직책</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">역할</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">로그인 타입</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">상태</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">가입일</th>
                <th className="px-4 py-3 text-left font-medium text-black dark:text-white">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">사용자가 없습니다</td></tr>
              ) : (
                data?.content.map((user) => (
                  <tr key={user.userId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.userId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{user.nickname}</td>
                    <td className="px-4 py-3">
                      {user.titleLabel ? (
                        <span className="inline-block rounded bg-meta-1/10 px-2 py-0.5 text-xs text-meta-1">
                          {user.titleLabel}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <MaskedField
                        value={user.email}
                        masked={user.emailMasked}
                        onReveal={() => setUnmaskTargetId(user.userId)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600 dark:bg-meta-4 dark:text-gray-300'
                      }`}>
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-meta-7/10 text-meta-7">
                        {snsTypeLabel[user.snsType ?? ""] ?? (user.snsType || "-")}
                      </span>
                    </td>
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

        {data && data.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            first={data.first}
            last={data.last}
            onPageChange={setPage}
            itemLabel="명"
          />
        )}
      </div>

      {unmaskTargetId !== null && (
        <UnmaskModal
          targetType="USER"
          targetId={unmaskTargetId}
          fieldLabel="이메일"
          onClose={() => setUnmaskTargetId(null)}
          onSuccess={() => {
            setUnmaskTargetId(null);
            load(page, keyword, status);
          }}
        />
      )}
    </div>
  );
}
