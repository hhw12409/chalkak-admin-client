"use client";
import React, { useEffect, useMemo, useState } from "react";
import { regionsApi } from "@/lib/api/regions";
import { Region } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import RegionFormModal from "@/components/Regions/RegionFormModal";
import RegionDeleteModal from "@/components/Regions/RegionDeleteModal";

/**
 * 지역 bbox 마스터 관리 화면.
 * - activeOnly 토글 + 이름 검색. 페이지네이션 없음(서울 25구 전제).
 * - 변경(등록/수정/active토글/삭제) 액션은 ADMIN 만 노출.
 */
export default function RegionsClient() {
  const { admin } = useAuth();
  const isAdmin = admin?.role === "ADMIN";

  const [items, setItems] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; region: Region } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<Region | null>(null);

  const load = () => {
    setLoading(true);
    regionsApi
      .list(activeOnly ? { activeOnly: true } : undefined)
      .then((rows) => {
        setItems(rows);
        setError("");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "지역 목록을 불러올 수 없습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((r) => r.name.toLowerCase().includes(kw));
  }, [items, keyword]);

  const handleToggleActive = async (r: Region) => {
    setActionLoading(r.regionId);
    try {
      await regionsApi.toggleActive(r.regionId, !r.active);
      load();
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
          <h1 className="text-2xl font-bold text-black dark:text-white">지역 마스터 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            지역(자치구) bbox 마스터를 관리합니다. 도장깨기 집계 영향 때문에 삭제보다 비활성을 권장합니다.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormModal({ mode: "create" })}
            className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            + 새 지역 등록
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4"
          />
          <span>활성만 표시</span>
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="지역명 검색"
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
      </div>

      {error && <div className="mb-4 text-sm text-meta-1">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            {items.length === 0 ? "등록된 지역이 없습니다" : "검색 결과가 없습니다"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">bbox (lat / lng)</th>
                  <th className="px-4 py-3 text-left font-medium">중심</th>
                  <th className="px-4 py-3 text-left font-medium">순서</th>
                  <th className="px-4 py-3 text-left font-medium">활성</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-medium">액션</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((r) => (
                  <tr
                    key={r.regionId}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    <td className="px-4 py-3 text-gray-500">{r.regionId}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      lat {r.latMin}~{r.latMax}
                      <br />
                      lng {r.lngMin}~{r.lngMax}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {r.centerLat}, {r.centerLng}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.displayOrder}</td>
                    <td className="px-4 py-3">
                      {r.active ? (
                        <span className="rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
                          활성
                        </span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                          비활성
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFormModal({ mode: "edit", region: r })}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleToggleActive(r)}
                            disabled={actionLoading === r.regionId}
                            className="rounded bg-meta-6 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            {r.active ? "비활성" : "활성"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-gray-500">
          지역 마스터의 등록/수정/삭제는 ADMIN 권한만 가능합니다.
        </p>
      )}

      {formModal && (
        <RegionFormModal
          mode={formModal.mode}
          region={formModal.mode === "edit" ? formModal.region : null}
          onClose={() => setFormModal(null)}
          onSuccess={() => load()}
        />
      )}

      {deleteTarget && (
        <RegionDeleteModal
          region={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => load()}
        />
      )}
    </div>
  );
}
