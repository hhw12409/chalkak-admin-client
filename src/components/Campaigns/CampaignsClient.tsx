"use client";
import React, { useEffect, useRef, useState } from "react";
import { campaignsApi } from "@/lib/api/campaigns";
import { Campaign, PageResponse } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/common/Pagination";
import CampaignFormModal from "@/components/Campaigns/CampaignFormModal";
import CampaignDeleteModal from "@/components/Campaigns/CampaignDeleteModal";

/**
 * 시즌 캠페인 관리 화면.
 * - isActive 필터 + 제목 키워드 검색 + 페이지네이션.
 * - 변경(등록/수정/active토글/삭제) 액션은 ADMIN 만 노출.
 */
export default function CampaignsClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [data, setData] = useState<PageResponse<Campaign> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; campaign: Campaign } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const load = (p: number, kw: string, active: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    campaignsApi
      .list({
        page: p,
        size: 20,
        keyword: kw || undefined,
        isActive: active === "" ? undefined : active === "true",
      })
      .then((res) => {
        if (reqId === reqIdRef.current) {
          setData(res);
          setError("");
        }
      })
      .catch((e) => {
        if (reqId === reqIdRef.current)
          setError(e instanceof Error ? e.message : "캠페인 목록을 불러올 수 없습니다.");
      })
      .finally(() => {
        if (reqId === reqIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    load(page, keyword, activeFilter);
  }, [page, activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, activeFilter);
    }, 300);
  };

  const handleToggleActive = async (c: Campaign) => {
    setActionLoading(c.campaignId);
    try {
      await campaignsApi.toggleActive(c.campaignId, !c.isActive);
      load(page, keyword, activeFilter);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "상태 변경 실패");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">캠페인 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            시즌 캠페인을 등록·수정합니다. 활성 토글은 노출만 끄며(복구 가능), 삭제는 소프트 삭제입니다.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormModal({ mode: "create" })}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 새 캠페인 등록
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="제목 검색"
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(0);
          }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">활성 여부 전체</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">기간</th>
                <th className="px-4 py-3 text-left font-medium">태그</th>
                <th className="px-4 py-3 text-left font-medium">배지키</th>
                <th className="px-4 py-3 text-left font-medium">활성</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">생성일</th>
                {isAdmin && <th className="px-4 py-3 text-left font-medium">액션</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-gray-400">
                    캠페인이 없습니다
                  </td>
                </tr>
              ) : (
                data?.content.map((c) => (
                  <tr
                    key={c.campaignId}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{c.campaignId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">
                        {c.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {c.startDate} ~ {c.endDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.targetTags
                          ? c.targetTags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .map((t, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                >
                                  {t}
                                </span>
                              ))
                          : <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.badgeKey ?? "-"}</td>
                    <td className="px-4 py-3">
                      {c.isActive ? (
                        <span className="rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
                          활성
                        </span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          c.status === "ACTIVE"
                            ? "bg-meta-3/10 text-meta-3"
                            : "bg-meta-5/10 text-meta-5"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.createdAt?.slice(0, 10)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFormModal({ mode: "edit", campaign: c })}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleToggleActive(c)}
                            disabled={actionLoading === c.campaignId}
                            className="rounded bg-meta-6 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            {c.isActive ? "비활성" : "활성"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    )}
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
          />
        )}
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-gray-500">
          캠페인의 등록/수정/삭제는 ADMIN 권한만 가능합니다.
        </p>
      )}

      {formModal && (
        <CampaignFormModal
          mode={formModal.mode}
          campaign={formModal.mode === "edit" ? formModal.campaign : null}
          onClose={() => setFormModal(null)}
          onSuccess={() => load(page, keyword, activeFilter)}
        />
      )}

      {deleteTarget && (
        <CampaignDeleteModal
          campaign={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => load(page, keyword, activeFilter)}
        />
      )}
    </div>
  );
}
