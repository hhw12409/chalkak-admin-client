"use client";
import React, { useEffect, useState } from "react";
import { reportsApi } from "@/lib/api/reports";
import { articlesApi } from "@/lib/api/articles";
import { ReportGroup, ReportDetail, ReportAction, AdminArticle } from "@/types/admin";

const reportActionOptions: { value: ReportAction; label: string }[] = [
  { value: "HIDE_CONTENT", label: "내용 숨김" },
  { value: "DELETE_CONTENT", label: "내용 삭제" },
  { value: "REJECT_REPORT", label: "신고 기각" },
  { value: "WARN_USER", label: "사용자 경고" },
];

const reasonLabel: Record<string, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절",
  VIOLENCE: "폭력",
  COPYRIGHT: "저작권",
  FALSE_INFO: "허위정보",
  ETC: "기타",
};

const actionLabel: Record<string, string> = {
  HIDE_CONTENT: "내용 숨김",
  DELETE_CONTENT: "내용 삭제",
  REJECT_REPORT: "신고 기각",
  WARN_USER: "사용자 경고",
};

export default function ReportListClient() {
  const [reports, setReports] = useState<ReportGroup[]>([]);
  const [targetType, setTargetType] = useState("");
  const [processedFilter, setProcessedFilter] = useState<string>("false");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ReportDetail[]>>({});
  const [articleCache, setArticleCache] = useState<Record<number, AdminArticle>>({});
  const [articleLoading, setArticleLoading] = useState<Record<number, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<ReportGroup | null>(null);
  const [action, setAction] = useState<ReportAction>("REJECT_REPORT");
  const [resolveReason, setResolveReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const load = (tt: string, pf: string) => {
    setLoading(true);
    reportsApi
      .getReports({
        targetType: tt || undefined,
        processedOnly: pf === "" ? undefined : pf === "true",
      })
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(targetType, processedFilter); }, [targetType, processedFilter]);

  const toggleExpand = async (report: ReportGroup) => {
    const key = `${report.targetType}_${report.targetId}`;
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(key);

    if (report.targetType === 'ARTICLE' && !articleCache[report.targetId]) {
      setArticleLoading((prev) => ({ ...prev, [report.targetId]: true }));
      articlesApi.getArticle(report.targetId)
        .then((a) => setArticleCache((prev) => ({ ...prev, [report.targetId]: a })))
        .catch(() => {})
        .finally(() => setArticleLoading((prev) => ({ ...prev, [report.targetId]: false })));
    }

    if (!details[key]) {
      try {
        const d = await reportsApi.getReportDetails(report.targetType, report.targetId);
        setDetails((prev) => ({ ...prev, [key]: d }));
      } catch {
        setDetails((prev) => ({ ...prev, [key]: [] }));
      }
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget || !resolveReason.trim()) return;
    setSubmitting(true);
    try {
      await reportsApi.resolveReport(resolveTarget.targetType, resolveTarget.targetId, action, resolveReason);
      setResolveTarget(null);
      setResolveReason("");
      setDetails({});
      setSuccessMessage(
        processedFilter === "false"
          ? "신고가 처리되었습니다. '전체' 또는 '처리완료만' 필터에서 처리 내역을 확인하세요."
          : "신고가 처리되었습니다."
      );
      window.setTimeout(() => setSuccessMessage(""), 2000);
      load(targetType, processedFilter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "처리 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">신고 관리</h1>
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 유형</option>
          <option value="ARTICLE">게시글</option>
          <option value="COMMENT">댓글</option>
        </select>
        <select
          value={processedFilter}
          onChange={(e) => setProcessedFilter(e.target.value)}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="false">미처리만</option>
          <option value="">전체</option>
          <option value="true">처리완료만</option>
        </select>
      </div>

      {successMessage && (
        <div className="mb-4 rounded border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {successMessage}
        </div>
      )}

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {loading ? (
          <div className="py-10 text-center text-gray-400">불러오는 중...</div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center text-gray-400">신고가 없습니다</div>
        ) : (
          reports.map((report) => {
            const key = `${report.targetType}_${report.targetId}`;
            const isExpanded = expandedKey === key;
            const rowBgClass = report.isProcessed
              ? "bg-gray-50 dark:bg-meta-4"
              : "hover:bg-gray-1 dark:hover:bg-meta-4";
            return (
              <div key={key} className="border-b border-stroke dark:border-strokedark">
                <div className={`flex items-center gap-4 px-4 py-3 ${rowBgClass}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {report.targetType === 'ARTICLE' ? '게시글' : '댓글'}
                      </span>
                      <span className="text-xs text-gray-500">ID: {report.targetId}</span>
                      {report.isProcessed ? (
                        <>
                          <span className="rounded bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            처리됨
                          </span>
                          <span className="text-xs text-gray-500">
                            총 신고 {report.reportCount}건
                          </span>
                          {report.resolvedAction && (
                            <span className="text-xs text-gray-500">
                              처리방식: {actionLabel[report.resolvedAction] ?? report.resolvedAction}
                            </span>
                          )}
                          {report.processedAt && (
                            <span className="text-xs text-gray-500">
                              처리일시: {report.processedAt.slice(0, 10)}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="rounded bg-meta-1/10 px-2 py-0.5 text-xs font-medium text-meta-1">
                            신고 {report.unprocessedCount}건 미처리
                          </span>
                          <span className="text-xs text-gray-500">
                            총 신고 {report.reportCount}건
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500">
                        주요사유: {reasonLabel[report.topReason] ?? report.topReason}
                      </span>
                    </div>
                    {report.isProcessed && report.resolveReason && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-meta-4 dark:text-gray-300">
                          처리코멘트
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {report.resolveReason}
                        </span>
                      </div>
                    )}
                    {report.targetPreview?.contentPreview && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{report.targetPreview.contentPreview}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      최근 신고: {report.lastReportedAt?.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleExpand(report)}
                      className="rounded border border-stroke px-3 py-1 text-sm hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      {isExpanded ? "접기" : "상세"}
                    </button>
                    {!report.isProcessed && (
                      <button
                        onClick={() => { setResolveTarget(report); setAction("REJECT_REPORT"); setResolveReason(""); }}
                        className="rounded bg-primary px-3 py-1 text-sm text-white hover:bg-opacity-90"
                      >
                        처리
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mx-4 mb-3 space-y-3">
                    {/* 콘텐츠 본문 */}
                    <div className="rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
                      <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                        {report.targetType === 'ARTICLE' ? '신고된 게시글' : '신고된 댓글'}
                      </p>
                      {report.targetType === 'ARTICLE' ? (
                        articleLoading[report.targetId] ? (
                          <p className="text-xs text-gray-400">게시글 불러오는 중...</p>
                        ) : articleCache[report.targetId] ? (
                          <div>
                            <p className="mb-1 text-sm font-medium text-black dark:text-white">
                              {articleCache[report.targetId].title}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              작성자 ID: {articleCache[report.targetId].userId}
                              {articleCache[report.targetId].category && ` · ${articleCache[report.targetId].category}`}
                              {' · '}{articleCache[report.targetId].createdAt?.slice(0, 10)}
                            </p>
                            <div className="rounded border border-stroke bg-white p-2 dark:border-strokedark dark:bg-boxdark max-h-40 overflow-y-auto">
                              <p className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {articleCache[report.targetId].content || '(내용 없음)'}
                              </p>
                            </div>
                            {articleCache[report.targetId].images && articleCache[report.targetId].images!.length > 0 && (
                              <div className="mt-2">
                                <p className="mb-1 text-xs text-gray-500">이미지 ({articleCache[report.targetId].images!.length}장)</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {articleCache[report.targetId].images!.map((url, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedImage(url)}
                                      className="h-16 w-16 shrink-0 overflow-hidden rounded border border-stroke hover:border-primary dark:border-strokedark"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={url} alt={`이미지 ${idx + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">
                            {report.targetPreview?.contentPreview || '미리보기 없음'}
                          </p>
                        )
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">작성자 ID: {report.targetPreview?.authorUserId}</p>
                          <div className="rounded border border-stroke bg-white p-2 dark:border-strokedark dark:bg-boxdark">
                            <p className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {report.targetPreview?.contentPreview || '(내용 없음)'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 개별 신고 목록 */}
                    <div className="rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
                      <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">개별 신고 목록</p>
                      {!details[key] ? (
                        <p className="text-xs text-gray-400">불러오는 중...</p>
                      ) : details[key].length === 0 ? (
                        <p className="text-xs text-gray-400">상세 신고 없음</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-stroke dark:border-strokedark">
                              <th className="py-1 text-left">신고자 ID</th>
                              <th className="py-1 text-left">사유</th>
                              <th className="py-1 text-left">설명</th>
                              <th className="py-1 text-left">신고일</th>
                              <th className="py-1 text-left">처리 상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details[key].map((d) => (
                              <tr key={d.reportId} className="border-b border-stroke dark:border-strokedark">
                                <td className="py-1">{d.reporterUserId}</td>
                                <td className="py-1">{reasonLabel[d.reason] ?? d.reason}</td>
                                <td className="py-1 max-w-xs truncate">{d.description ?? "-"}</td>
                                <td className="py-1">{d.reportedAt?.slice(0, 10)}</td>
                                <td className="py-1">
                                  {d.processedAt ? (
                                    <div className="space-y-0.5">
                                      <span className="rounded bg-success/10 px-1.5 py-0.5 text-success">
                                        처리됨 · {d.processedAt.slice(0, 10)}
                                        {d.resolvedAction ? ` · ${actionLabel[d.resolvedAction] ?? d.resolvedAction}` : ''}
                                      </span>
                                      {d.resolveReason && (
                                        <p className="text-gray-500 dark:text-gray-400 break-words">
                                          {d.resolveReason}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-meta-1">미처리</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[85vh] overflow-y-auto">
            <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">신고 처리</h3>
            <p className="mb-3 text-sm text-gray-500">
              {resolveTarget.targetType === 'ARTICLE' ? '게시글' : '댓글'} ID: {resolveTarget.targetId} (신고 {resolveTarget.reportCount}건)
            </p>

            {/* 신고 대상 콘텐츠 */}
            <div className="mb-4 rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
              <p className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {resolveTarget.targetType === 'ARTICLE' ? '신고된 게시글' : '신고된 댓글'}
              </p>
              {resolveTarget.targetType === 'ARTICLE' && articleCache[resolveTarget.targetId] ? (
                <div>
                  <p className="mb-1 text-sm font-medium text-black dark:text-white line-clamp-1">
                    {articleCache[resolveTarget.targetId].title}
                  </p>
                  <p className="text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
                    {articleCache[resolveTarget.targetId].content}
                  </p>
                  {articleCache[resolveTarget.targetId].images && articleCache[resolveTarget.targetId].images!.length > 0 && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs text-gray-500">이미지 ({articleCache[resolveTarget.targetId].images!.length}장)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {articleCache[resolveTarget.targetId].images!.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImage(url)}
                            className="h-16 w-16 shrink-0 overflow-hidden rounded border border-stroke hover:border-primary dark:border-strokedark"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`이미지 ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {resolveTarget.targetPreview?.contentPreview || '(미리보기 없음)'}
                </p>
              )}
            </div>
            <form onSubmit={handleResolve}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">처리 방식</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as ReportAction)}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  {reportActionOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">처리 사유 *</label>
                <textarea
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="처리 사유를 입력하세요"
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setResolveTarget(null)}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">취소</button>
                <button type="submit" disabled={submitting}
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
                  {submitting ? "처리 중..." : "처리 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
