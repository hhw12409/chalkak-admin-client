"use client";
import React, { useEffect, useRef, useState } from "react";
import { articlesApi } from "@/lib/api/articles";
import { AdminArticle, PageResponse } from "@/types/admin";

const statusLabel: Record<string, string> = {
  ACTIVE: "활성",
  DELETED: "삭제됨",
};

export default function ArticleListClient() {
  const [data, setData] = useState<PageResponse<AdminArticle> | null>(null);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [isHidden, setIsHidden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailModal, setDetailModal] = useState<AdminArticle | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, kw: string, st: string, ih: string) => {
    setLoading(true);
    articlesApi
      .getArticles({
        page: p,
        size: 20,
        keyword: kw || undefined,
        status: st || undefined,
        isHidden: ih === "" ? undefined : ih === "true",
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, keyword, status, isHidden);
  }, [page, status, isHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, val, status, isHidden);
    }, 300);
  };

  const handleHide = async (id: number) => {
    const reason = prompt("숨김 처리 사유 (선택)");
    if (reason === null) return;
    setActionLoading(id);
    try {
      await articlesApi.hideArticle(id, reason || undefined);
      load(page, keyword, status, isHidden);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "숨김 처리 실패");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (id: number) => {
    if (!confirm("숨김을 해제하시겠습니까?")) return;
    setActionLoading(id);
    try {
      await articlesApi.unhideArticle(id);
      load(page, keyword, status, isHidden);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "숨김 해제 실패");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    const reason = prompt("삭제 사유를 입력하세요 (필수)");
    if (!reason) return;
    setActionLoading(id);
    try {
      await articlesApi.deleteArticle(id, reason);
      load(page, keyword, status, isHidden);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("게시글을 복원하시겠습니까?")) return;
    setActionLoading(id);
    try {
      await articlesApi.restoreArticle(id);
      load(page, keyword, status, isHidden);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "복원 실패");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">콘텐츠 관리</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="제목·내용 검색"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="DELETED">삭제됨</option>
        </select>
        <select
          value={isHidden}
          onChange={(e) => { setIsHidden(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">숨김 여부 전체</option>
          <option value="true">숨김</option>
          <option value="false">공개</option>
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">작성자ID</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">숨김</th>
                <th className="px-4 py-3 text-left font-medium">조회/좋아요</th>
                <th className="px-4 py-3 text-left font-medium">작성일</th>
                <th className="px-4 py-3 text-left font-medium">상세</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">게시글이 없습니다</td></tr>
              ) : (
                data?.content.map((article) => (
                  <tr key={article.articleId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{article.articleId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">{article.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.userId}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        article.status === 'ACTIVE' ? 'bg-meta-3/10 text-meta-3' : 'bg-meta-5/10 text-meta-5'
                      }`}>
                        {statusLabel[article.status] ?? article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {article.isHidden ? (
                        <span className="rounded bg-meta-6/10 px-2 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.readCount ?? 0} / {article.likeCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500">{article.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          setCurrentImageIndex(0);
                          setDetailLoading(true);
                          setDetailModal(article);
                          try {
                            const full = await articlesApi.getArticle(article.articleId);
                            setDetailModal(full);
                          } finally {
                            setDetailLoading(false);
                          }
                        }}
                        className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                      >
                        상세
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {article.isHidden ? (
                          <button
                            onClick={() => handleUnhide(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-3 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김해제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-6 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            숨김
                          </button>
                        )}
                        {article.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleDelete(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            삭제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(article.articleId)}
                            disabled={actionLoading === article.articleId}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-40"
                          >
                            복원
                          </button>
                        )}
                      </div>
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
              {page + 1} / {data.totalPages} 페이지 (총 {data.totalElements}개)
            </span>
            <div className="flex gap-2">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40">이전</button>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)}
                className="rounded border border-stroke px-3 py-1 text-sm disabled:opacity-40">다음</button>
            </div>
          </div>
        )}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="원본 이미지"
            className="max-h-[90vh] max-w-[90vw] rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 text-white text-3xl leading-none hover:opacity-70"
          >
            &times;
          </button>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white pr-4">{detailModal.title}</h3>
              <button onClick={() => { setDetailModal(null); setSelectedImage(null); }} className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">게시글 ID:</span> {detailModal.articleId}</p>
              <p><span className="font-medium">작성자 ID:</span> {detailModal.userId}</p>
              <p><span className="font-medium">카테고리:</span> {detailModal.category ?? '-'}</p>
              <p><span className="font-medium">타입 ID:</span> {detailModal.articleTypeId}</p>
              <p>
                <span className="font-medium">상태:</span>{' '}
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  detailModal.status === 'ACTIVE' ? 'bg-meta-3/10 text-meta-3' : 'bg-meta-5/10 text-meta-5'
                }`}>
                  {statusLabel[detailModal.status] ?? detailModal.status}
                </span>
              </p>
              <p>
                <span className="font-medium">숨김:</span>{' '}
                {detailModal.isHidden
                  ? <span className="rounded bg-meta-6/10 px-1.5 py-0.5 text-xs font-medium text-meta-6">숨김</span>
                  : <span className="text-gray-400">공개</span>
                }
              </p>
              <p><span className="font-medium">조회수:</span> {(detailModal.readCount ?? 0).toLocaleString()}</p>
              <p><span className="font-medium">좋아요:</span> {(detailModal.likeCount ?? 0).toLocaleString()}</p>
              {detailModal.location && (
                <p className="col-span-2"><span className="font-medium">위치:</span> {detailModal.location}</p>
              )}
              {(detailModal.latitude != null && detailModal.longitude != null) && (
                <p className="col-span-2"><span className="font-medium">좌표:</span> {detailModal.latitude}, {detailModal.longitude}</p>
              )}
              <p><span className="font-medium">작성일:</span> {detailModal.createdAt?.slice(0, 16).replace('T', ' ')}</p>
              <p><span className="font-medium">수정일:</span> {detailModal.updatedAt?.slice(0, 16).replace('T', ' ')}</p>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-black dark:text-white">본문</p>
              <div className="rounded border border-stroke p-3 dark:border-strokedark">
                {detailLoading ? (
                  <p className="text-sm text-gray-400">불러오는 중...</p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{detailModal.content || '(내용 없음)'}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-black dark:text-white">
                이미지 ({detailModal.images?.length ?? 0}장)
              </p>
              {detailLoading ? (
                <div className="flex h-48 items-center justify-center rounded border border-stroke bg-gray-1 dark:border-strokedark dark:bg-meta-4">
                  <span className="text-sm text-gray-400">불러오는 중...</span>
                </div>
              ) : detailModal.images && detailModal.images.length > 0 ? (
                <>
                  <div className="relative overflow-hidden rounded border border-stroke bg-black dark:border-strokedark" style={{ aspectRatio: '4/3' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detailModal.images[currentImageIndex]}
                      alt={`이미지 ${currentImageIndex + 1}`}
                      className="h-full w-full cursor-zoom-in object-contain"
                      onClick={() => setSelectedImage(detailModal.images![currentImageIndex])}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                    />
                    {detailModal.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(i => (i - 1 + detailModal.images!.length) % detailModal.images!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(i => (i + 1) % detailModal.images!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                          {detailModal.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <span className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                      {currentImageIndex + 1} / {detailModal.images.length}
                    </span>
                  </div>
                  {detailModal.images.length > 1 && (
                    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                      {detailModal.images.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition-colors ${i === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-32 items-center justify-center rounded border border-dashed border-stroke bg-gray-1 dark:border-strokedark dark:bg-meta-4">
                  <span className="text-sm text-gray-400">이미지 없음</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {detailModal.isHidden ? (
                <button
                  onClick={async () => { await handleUnhide(detailModal.articleId); setDetailModal(null); }}
                  className="rounded bg-meta-3 px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                >
                  숨김 해제
                </button>
              ) : (
                <button
                  onClick={async () => { const reason = prompt("숨김 사유 (선택)"); if (reason === null) return; await handleHide(detailModal.articleId); setDetailModal(null); }}
                  className="rounded bg-meta-6 px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                >
                  숨김 처리
                </button>
              )}
              {detailModal.status === 'ACTIVE' ? (
                <button
                  onClick={async () => { const reason = prompt("삭제 사유 (필수)"); if (!reason) return; await handleDelete(detailModal.articleId); setDetailModal(null); }}
                  className="rounded bg-meta-1 px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                >
                  삭제
                </button>
              ) : (
                <button
                  onClick={async () => { await handleRestore(detailModal.articleId); setDetailModal(null); }}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
                >
                  복원
                </button>
              )}
              <button onClick={() => { setDetailModal(null); setSelectedImage(null); }} className="rounded border border-stroke px-3 py-1.5 text-sm hover:bg-gray-1">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
