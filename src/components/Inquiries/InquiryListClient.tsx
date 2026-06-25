"use client";
import React, { useEffect, useRef, useState } from "react";
import { inquiriesApi } from "@/lib/api/inquiries";
import { AdminInquiry, PageResponse } from "@/types/admin";
import Pagination from "@/components/common/Pagination";
import CsvExportButton from "@/components/common/CsvExportButton";

const statusLabel: Record<string, string> = {
  "답변대기": "미처리",
  "답변완료": "답변완료",
};

export default function InquiryListClient() {
  const [data, setData] = useState<PageResponse<AdminInquiry> | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailModal, setDetailModal] = useState<AdminInquiry | null>(null);
  const [answerModal, setAnswerModal] = useState<AdminInquiry | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reqIdRef = useRef(0);

  const load = (p: number, st: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    inquiriesApi
      .getInquiries({ page: p, size: 20, status: st || undefined })
      .then((res) => { if (reqId === reqIdRef.current) setData(res); })
      .catch((e) => { if (reqId === reqIdRef.current) setError(e.message); })
      .finally(() => { if (reqId === reqIdRef.current) setLoading(false); });
  };

  useEffect(() => { load(page, status); }, [page, status]);

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerModal || !answer.trim()) return;
    setSubmitting(true);
    try {
      await inquiriesApi.answerInquiry(answerModal.inquiryId, answer);
      setAnswerModal(null);
      setDetailModal(null);
      setAnswer("");
      load(page, status);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "답변 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">문의 관리</h1>
        <CsvExportButton
          exportPath="/inquiries/export"
          requiredRole="OPERATOR"
          label="문의 CSV"
          fallbackFilename="chalkak_admin_inquiries.csv"
          filterParams={{ status }}
        />
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
        >
          <option value="">전체 상태</option>
          <option value="답변대기">미처리</option>
          <option value="답변완료">답변완료</option>
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
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">작성자ID</th>
                <th className="px-4 py-3 text-left font-medium">작성일</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : data?.content.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">문의가 없습니다</td></tr>
              ) : (
                data?.content.map((inquiry) => (
                  <tr key={inquiry.inquiryId} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="px-4 py-3 text-gray-500">{inquiry.inquiryId}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1 font-medium text-black dark:text-white">{inquiry.inquiryTitle}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inquiry.category}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        inquiry.status === '답변대기' ? 'bg-meta-6/10 text-meta-6' : 'bg-meta-3/10 text-meta-3'
                      }`}>
                        {statusLabel[inquiry.status] ?? inquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inquiry.userId}</td>
                    <td className="px-4 py-3 text-gray-500">{inquiry.createdAt?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setDetailModal(inquiry)}
                          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                        >
                          상세
                        </button>
                        {inquiry.status === '답변대기' && (
                          <button
                            onClick={() => { setAnswerModal(inquiry); setAnswer(""); }}
                            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            답변
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

        {data && data.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            first={data.first}
            last={data.last}
            onPageChange={setPage}
            itemLabel="건"
          />
        )}
      </div>

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">{detailModal.inquiryTitle}</h3>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-1"><span className="font-medium">카테고리:</span> {detailModal.category}</p>
              <p className="mb-1"><span className="font-medium">작성자:</span> {detailModal.userId}</p>
              <p><span className="font-medium">작성일:</span> {detailModal.createdAt?.slice(0, 10)}</p>
            </div>
            <div className="mb-4 rounded border border-stroke p-3 dark:border-strokedark">
              <p className="text-sm whitespace-pre-wrap">{detailModal.inquiryContent}</p>
            </div>
            {detailModal.inquiryImages && detailModal.inquiryImages.trim() !== "" && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-gray-500">첨부 이미지</p>
                <div className="flex flex-wrap gap-2">
                  {detailModal.inquiryImages.split(",").map((url, i) => (
                    <a key={i} href={url.trim()} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url.trim()}
                        alt={`첨부-${i + 1}`}
                        className="h-24 w-24 rounded border border-stroke object-cover hover:opacity-80"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {detailModal.answer && (
              <div className="rounded bg-meta-3/5 border border-meta-3/20 p-3">
                <p className="mb-1 text-xs font-semibold text-meta-3">답변</p>
                <p className="text-sm whitespace-pre-wrap">{detailModal.answer}</p>
                {detailModal.answeredAt && (
                  <p className="mt-1 text-xs text-gray-400">{detailModal.answeredAt?.slice(0, 10)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {answerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">답변 작성</h3>
            <p className="mb-4 text-sm text-gray-500 line-clamp-1">{answerModal.inquiryTitle}</p>
            <form onSubmit={handleAnswer}>
              <div className="mb-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  rows={5}
                  placeholder="답변 내용을 입력하세요"
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAnswerModal(null)}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">취소</button>
                <button type="submit" disabled={submitting}
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
                  {submitting ? "전송 중..." : "답변 전송"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
