"use client";
import React, { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import { DashboardSummary, DashboardTrend } from "@/types/admin";
import CardDataStats from "@/components/CardDataStats";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<DashboardTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([dashboardApi.getSummary(), dashboardApi.getTrends(7)])
      .then(([s, t]) => {
        setSummary(s);
        setTrend(t);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">데이터 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        오류: {error}
      </div>
    );
  }

  if (!summary) return null;

  const userIcon = (
    <svg className="fill-primary" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z" fill="" />
      <path d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z" fill="" />
    </svg>
  );

  const articleIcon = (
    <svg className="fill-primary" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.25 3.25H2.75C2.2 3.25 1.75 3.7 1.75 4.25V17.75C1.75 18.3 2.2 18.75 2.75 18.75H19.25C19.8 18.75 20.25 18.3 20.25 17.75V4.25C20.25 3.7 19.8 3.25 19.25 3.25ZM18.75 17.25H3.25V4.75H18.75V17.25Z" fill="" />
      <path d="M6.25 8.25H15.75C16.0261 8.25 16.25 8.02614 16.25 7.75C16.25 7.47386 16.0261 7.25 15.75 7.25H6.25C5.97386 7.25 5.75 7.47386 5.75 7.75C5.75 8.02614 5.97386 8.25 6.25 8.25Z" fill="" />
      <path d="M6.25 11.25H15.75C16.0261 11.25 16.25 11.0261 16.25 10.75C16.25 10.4739 16.0261 10.25 15.75 10.25H6.25C5.97386 10.25 5.75 10.4739 5.75 10.75C5.75 11.0261 5.97386 11.25 6.25 11.25Z" fill="" />
      <path d="M6.25 14.25H11.25C11.5261 14.25 11.75 14.0261 11.75 13.75C11.75 13.4739 11.5261 13.25 11.25 13.25H6.25C5.97386 13.25 5.75 13.4739 5.75 13.75C5.75 14.0261 5.97386 14.25 6.25 14.25Z" fill="" />
    </svg>
  );

  const reportIcon = (
    <svg className="fill-primary" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1C5.477 1 1 5.477 1 11C1 16.523 5.477 21 11 21C16.523 21 21 16.523 21 11C21 5.477 16.523 1 11 1ZM11 19C6.589 19 3 15.411 3 11C3 6.589 6.589 3 11 3C15.411 3 19 6.589 19 11C19 15.411 15.411 19 11 19Z" fill="" />
      <path d="M10 7H12V13H10V7Z" fill="" />
      <path d="M10 14H12V16H10V14Z" fill="" />
    </svg>
  );

  const inquiryIcon = (
    <svg className="fill-primary" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H8L11 21L14 18H18C19.1 18 20 17.1 20 16V4C20 2.9 19.1 2 18 2ZM18 16H13.17L11 18.17L8.83 16H4V4H18V16Z" fill="" />
    </svg>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">대시보드</h1>
        <p className="text-sm text-gray-500">찰칵 서비스 현황</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="전체 사용자" total={summary.totalUsers.toLocaleString()} rate={`+${summary.newUsersToday}`} levelUp>
          {userIcon}
        </CardDataStats>
        <CardDataStats title="활성 사용자" total={summary.activeUsers.toLocaleString()} rate="">
          {userIcon}
        </CardDataStats>
        <CardDataStats title="오늘 신규 가입" total={summary.newUsersToday.toLocaleString()} rate="" levelUp>
          {userIcon}
        </CardDataStats>
        <CardDataStats title="탈퇴 사용자" total={summary.deletedUsers.toLocaleString()} rate="" levelDown>
          {userIcon}
        </CardDataStats>

        <CardDataStats title="전체 게시글" total={summary.totalArticles.toLocaleString()} rate={`+${summary.newArticlesToday}`} levelUp>
          {articleIcon}
        </CardDataStats>
        <CardDataStats title="활성 게시글" total={summary.activeArticles.toLocaleString()} rate="">
          {articleIcon}
        </CardDataStats>
        <CardDataStats title="숨김 게시글" total={summary.hiddenArticles.toLocaleString()} rate="" levelDown>
          {articleIcon}
        </CardDataStats>
        <CardDataStats title="삭제 게시글" total={summary.deletedArticles.toLocaleString()} rate="" levelDown>
          {articleIcon}
        </CardDataStats>

        <CardDataStats title="전체 신고" total={summary.totalReports.toLocaleString()} rate="">
          {reportIcon}
        </CardDataStats>
        <CardDataStats title="전체 문의" total={summary.totalInquiries.toLocaleString()} rate="">
          {inquiryIcon}
        </CardDataStats>
        <CardDataStats title="미처리 문의" total={summary.pendingInquiries.toLocaleString()} rate="" levelDown>
          {inquiryIcon}
        </CardDataStats>
        <CardDataStats title="오늘 신규 게시글" total={summary.newArticlesToday.toLocaleString()} rate="" levelUp>
          {articleIcon}
        </CardDataStats>
      </div>

      {trend && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TrendCard title="신규 사용자 추이 (7일)" data={trend.userTrend} color="#3056D3" />
          <TrendCard title="신규 게시글 추이 (7일)" data={trend.articleTrend} color="#10B981" />
        </div>
      )}
    </div>
  );
}

function TrendCard({ title, data, color }: { title: string; data: { date: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">{title}</h3>
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t"
              style={{ height: `${Math.round((d.count / max) * 80)}px`, backgroundColor: color, minHeight: '4px' }}
              title={`${d.date}: ${d.count}`}
            />
            <span className="text-[9px] text-gray-400 rotate-45 origin-left">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
