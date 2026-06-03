"use client";
import React, { useEffect, useRef, useState } from "react";
import { keywordsApi } from "@/lib/api/keywords";
import { PopularKeyword, SearchKeyword, SearchType, PagedResponseDto } from "@/types/admin";
import Pagination from "@/components/common/Pagination";
import PopularKeywordEditModal from "./PopularKeywordEditModal";
import PopularKeywordDeleteModal from "./PopularKeywordDeleteModal";
import PopularKeywordTabs from "./PopularKeywordTabs";

export default function KeywordClient() {
  const [popular, setPopular] = useState<PopularKeyword[]>([]);
  const [activeType, setActiveType] = useState<SearchType>("PHOTO_SPOT");
  const [searchData, setSearchData] = useState<PagedResponseDto<SearchKeyword> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<PopularKeyword | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PopularKeyword | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPopular = (searchType: SearchType) =>
    keywordsApi.getPopularKeywords(searchType).then(setPopular).catch(() => {});
  const loadSearch = (p: number, kw: string) => {
    setLoading(true);
    keywordsApi
      .getSearchKeywords({ page: p, size: 50, keyword: kw || undefined })
      .then(setSearchData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPopular(activeType);
    loadSearch(0, "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeChange = (type: SearchType) => {
    if (type === activeType) return;
    setActiveType(type);
    setPopular([]);
    loadPopular(type);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSearch(page, keyword); }, [page]); // keyword handled via debounce

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      loadSearch(0, val);
    }, 300);
  };

  const handleRebuild = async () => {
    if (!confirm("인기 검색어를 수동으로 재집계하시겠습니까?")) return;
    setRebuilding(true);
    try {
      await keywordsApi.rebuildPopularKeywords(activeType);
      await loadPopular(activeType);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "재집계 실패");
    } finally {
      setRebuilding(false);
    }
  };

  const rankChangeLabel = (change: number) => {
    if (change > 0) return <span className="text-meta-3">▲{change}</span>;
    if (change < 0) return <span className="text-meta-1">▼{Math.abs(change)}</span>;
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">키워드 관리</h1>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 인기 검색어 */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h2 className="font-semibold text-black dark:text-white">인기 검색어 TOP</h2>
            <button
              onClick={handleRebuild}
              disabled={rebuilding}
              className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {rebuilding ? "집계 중..." : "수동 재집계"}
            </button>
          </div>
          <div className="border-b border-stroke px-6 py-3 dark:border-strokedark">
            <PopularKeywordTabs value={activeType} onChange={handleTypeChange} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">순위</th>
                  <th className="px-4 py-3 text-left font-medium">키워드</th>
                  <th className="px-4 py-3 text-left font-medium">변동</th>
                  <th className="px-4 py-3 text-left font-medium">NEW</th>
                  <th className="px-4 py-3 text-left font-medium">검색 수</th>
                  <th className="px-4 py-3 text-left font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {popular.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">데이터 없음</td></tr>
                ) : (
                  popular.map((kw) => (
                    <tr key={kw.popularKeywordId} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-3 font-bold text-black dark:text-white">{kw.rank}</td>
                      <td className="px-4 py-3">{kw.keyword}</td>
                      <td className="px-4 py-3">{rankChangeLabel(kw.rankChange)}</td>
                      <td className="px-4 py-3">
                        {kw.isNew ? (
                          <span className="inline-flex items-center rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
                            NEW
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{kw.searchCount?.toLocaleString() ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditTarget(kw)}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => setDeleteTarget(kw)}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            긴급삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 검색 로그 */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h2 className="font-semibold text-black dark:text-white">검색 내역</h2>
          </div>
          <div className="px-4 py-3 border-b border-stroke dark:border-strokedark">
            <input
              type="text"
              placeholder="키워드 검색"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              className="w-full rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-4 py-3 text-left font-medium">키워드</th>
                  <th className="px-4 py-3 text-left font-medium">사용자 ID</th>
                  <th className="px-4 py-3 text-left font-medium">검색 시각</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">불러오는 중...</td></tr>
                ) : searchData?.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">데이터 없음</td></tr>
                ) : (
                  searchData?.data.map((sk) => (
                    <tr key={sk.searchKeywordId} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-3 font-medium">{sk.searchKeyword}</td>
                      <td className="px-4 py-3 text-gray-500">{sk.userId}</td>
                      <td className="px-4 py-3 text-gray-500">{sk.createdAt?.slice(0, 16)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {searchData && searchData.totalPages > 0 && (
            <Pagination
              page={page}
              totalPages={searchData.totalPages}
              totalElements={searchData.total}
              first={searchData.first}
              last={searchData.last}
              onPageChange={setPage}
              itemLabel="건"
            />
          )}
        </div>
      </div>

      {editTarget && (
        <PopularKeywordEditModal
          keyword={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            loadPopular(activeType);
          }}
        />
      )}

      {deleteTarget && (
        <PopularKeywordDeleteModal
          keyword={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            loadPopular(activeType);
          }}
        />
      )}
    </div>
  );
}
