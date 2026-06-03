"use client";
import React, { useEffect, useState } from "react";
import { articlesApi } from "@/lib/api/articles";
import { keywordsApi } from "@/lib/api/keywords";
import { AdminArticle, PopularKeyword } from "@/types/admin";

type SortType = "READ_COUNT" | "LIKE_COUNT";

const MEDALS = ["🥇", "🥈", "🥉"];

function ArticleRankTable({
  title,
  sortBy,
}: {
  title: string;
  sortBy: SortType;
}) {
  const [data, setData] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    articlesApi
      .getTopArticles(sortBy, 10)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sortBy]);

  const metric = (a: AdminArticle) =>
    sortBy === "LIKE_COUNT" ? a.likeCount ?? 0 : a.readCount ?? 0;

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h2 className="font-semibold text-black dark:text-white">{title}</h2>
      </div>

      {error && (
        <p className="px-6 py-4 text-sm text-red-500">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 text-left font-medium w-12">순위</th>
              <th className="px-4 py-3 text-left font-medium">제목</th>
              <th className="px-4 py-3 text-left font-medium w-20">작성자</th>
              <th className="px-4 py-3 text-right font-medium w-24">
                {sortBy === "LIKE_COUNT" ? "좋아요" : "조회수"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  데이터 없음
                </td>
              </tr>
            ) : (
              data.map((article, idx) => (
                <tr
                  key={article.articleId}
                  className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-3 text-center font-bold">
                    {idx < 3 ? (
                      <span className="text-base">{MEDALS[idx]}</span>
                    ) : (
                      <span className="text-gray-500">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-1 font-medium text-black dark:text-white">
                      {article.title}
                    </span>
                    {article.category && (
                      <span className="ml-1 text-xs text-gray-400">
                        [{article.category}]
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    #{article.userId}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {metric(article).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeywordRankTable() {
  const [data, setData] = useState<PopularKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    keywordsApi
      .getPopularKeywords("PHOTO_SPOT")
      .then((list) => setData(list.slice(0, 10)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rankChangeLabel = (change: number) => {
    if (change > 0)
      return <span className="text-xs font-medium text-meta-3">▲{change}</span>;
    if (change < 0)
      return (
        <span className="text-xs font-medium text-meta-1">
          ▼{Math.abs(change)}
        </span>
      );
    return <span className="text-xs text-gray-400">-</span>;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h2 className="font-semibold text-black dark:text-white">
          인기 검색어 TOP 10
        </h2>
      </div>

      {error && (
        <p className="px-6 py-4 text-sm text-red-500">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 text-left font-medium w-12">순위</th>
              <th className="px-4 py-3 text-left font-medium">키워드</th>
              <th className="px-4 py-3 text-left font-medium w-16">변동</th>
              <th className="px-4 py-3 text-right font-medium w-24">검색 수</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  데이터 없음
                </td>
              </tr>
            ) : (
              data.map((kw, idx) => (
                <tr
                  key={kw.keyword}
                  className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-3 text-center font-bold">
                    {idx < 3 ? (
                      <span className="text-base">{MEDALS[idx]}</span>
                    ) : (
                      <span className="text-gray-500">{kw.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-black dark:text-white">
                    {kw.keyword}
                  </td>
                  <td className="px-4 py-3">
                    {rankChangeLabel(kw.rankChange)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {kw.searchCount?.toLocaleString() ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MetricsPanel() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          지표 분석 (Raw 데이터)
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          운영 노출에는 직접 반영되지 않는 분석용 지표입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
        <ArticleRankTable title="조회수 TOP 10 게시글" sortBy="READ_COUNT" />
        <ArticleRankTable title="좋아요 TOP 10 게시글" sortBy="LIKE_COUNT" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <KeywordRankTable />
      </div>
    </div>
  );
}
