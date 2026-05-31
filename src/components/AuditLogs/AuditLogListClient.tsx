"use client";
import React, { useEffect, useRef, useState } from "react";
import { auditLogsApi } from "@/lib/api/auditLogs";
import { AuditLog, PageResponse } from "@/types/admin";

const targetTypes = ["", "USER", "ARTICLE", "COMMENT", "INQUIRY", "BANNER", "BOARD", "PLACE_TYPE", "ARTICLE_TYPE"];

export default function AuditLogListClient() {
  const [data, setData] = useState<PageResponse<AuditLog> | null>(null);
  const [page, setPage] = useState(0);
  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, aid: string, act: string, tt: string) => {
    setLoading(true);
    auditLogsApi
      .getAuditLogs({
        page: p,
        size: 50,
        adminId: aid ? Number(aid) : undefined,
        action: act || undefined,
        targetType: tt || undefined,
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(page, adminId, action, targetType); }, [page, targetType]);

  const handleActionChange = (val: string) => {
    setAction(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, adminId, val, targetType);
    }, 300);
  };

  const handleAdminIdChange = (val: string) => {
    setAdminId(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, action, targetType);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">감사 로그</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="number"
          placeholder="운영자 ID"
          value={adminId}
          onChange={(e) => handleAdminIdChange(e.target.value)}
          className="w-32 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <input
          type="text"
          placeholder="액션 검색 (예: HIDE_ARTICLE)"
          value={action}
          onChange={(e) => handleActionChange(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={targetType}
          onChange={(e) => { setTargetType(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 대상</option>
          {targetTypes.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">운영자</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
                <th className="px-4 py-3 text-left font-medium">대상</th>
                <th className="px-4 py-3 text-left font-medium">결과</th>
                <th className="px-4 py-3 text-left font-medium">사유</th>
                <th className="px-4 py-3 text-left font-medium">IP</th>
                <th className="px-4 py-3 text-left font-medium">시각</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">로그 없음</td></tr>
              ) : (
                data?.content.map((log) => (
                  <tr key={log.auditId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{log.auditId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{log.adminUsername}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-meta-4">{log.action}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {log.targetType ? `${log.targetType}#${log.targetId}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        log.result === "SUCCESS" ? "bg-meta-3/10 text-meta-3" : "bg-meta-1/10 text-meta-1"
                      }`}>
                        {log.result === "SUCCESS" ? "성공" : "실패"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-500">{log.reason ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{log.requestIp ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.createdAt?.slice(0, 16)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-3 dark:border-strokedark">
            <span className="text-sm text-gray-500">
              {page + 1} / {data.totalPages} 페이지 (총 {data.totalElements}건)
            </span>
            <div className="flex gap-2">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >이전</button>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
