"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { inquiriesApi } from "@/lib/api/inquiries";
import { AdminInquiry } from "@/types/admin";
import { formatRelativeTime } from "@/lib/utils";

const DropdownMessage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inquiriesApi
      .getInquiries({ status: "답변대기", size: 1 })
      .then((res) => setPendingCount(res?.totalElements ?? 0));
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    setLoading(true);
    inquiriesApi
      .getInquiries({ status: "답변대기", size: 5 })
      .then((res) => {
        setInquiries(res?.content ?? []);
        setPendingCount(res?.totalElements ?? 0);
      })
      .finally(() => setLoading(false));
  }, [dropdownOpen]);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <span
            className={`absolute -right-0.5 -top-0.5 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              pendingCount === 0 ? "hidden" : "inline"
            }`}
          />

          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.9688 1.57495H7.03135C3.43135 1.57495 0.506348 4.41558 0.506348 7.90308C0.506348 11.3906 2.75635 13.8375 8.26885 16.3125C8.40947 16.3687 8.52197 16.3968 8.6626 16.3968C8.85947 16.3968 9.02822 16.3406 9.19697 16.2281C9.47822 16.0593 9.64697 15.75 9.64697 15.4125V14.2031H10.9688C14.5688 14.2031 17.522 11.3625 17.522 7.87495C17.522 4.38745 14.5688 1.57495 10.9688 1.57495ZM10.9688 12.9937H9.3376C8.80322 12.9937 8.35322 13.4437 8.35322 13.9781V15.0187C3.6001 12.825 1.74385 10.8 1.74385 7.9312C1.74385 5.14683 4.10635 2.8687 7.03135 2.8687H10.9688C13.8657 2.8687 16.2563 5.14683 16.2563 7.9312C16.2563 10.7156 13.8657 12.9937 10.9688 12.9937Z"
              fill=""
            />
            <path
              d="M5.42812 7.28442C5.0625 7.28442 4.78125 7.56567 4.78125 7.9313C4.78125 8.29692 5.0625 8.57817 5.42812 8.57817C5.79375 8.57817 6.075 8.29692 6.075 7.9313C6.075 7.56567 5.79375 7.28442 5.42812 7.28442Z"
              fill=""
            />
            <path
              d="M9.00015 7.28442C8.63452 7.28442 8.35327 7.56567 8.35327 7.9313C8.35327 8.29692 8.63452 8.57817 9.00015 8.57817C9.33765 8.57817 9.64702 8.29692 9.64702 7.9313C9.64702 7.56567 9.33765 7.28442 9.00015 7.28442Z"
              fill=""
            />
            <path
              d="M12.5719 7.28442C12.2063 7.28442 11.925 7.56567 11.925 7.9313C11.925 8.29692 12.2063 8.57817 12.5719 8.57817C12.9375 8.57817 13.2188 8.29692 13.2188 7.9313C13.2188 7.56567 12.9094 7.28442 12.5719 7.28442Z"
              fill=""
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute -right-16 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
            <div className="px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                미답변 문의{pendingCount > 0 && ` (${pendingCount})`}
              </h5>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              {loading && (
                <li className="px-4.5 py-4 text-sm text-bodydark2">
                  로딩 중...
                </li>
              )}
              {!loading && inquiries.length === 0 && (
                <li className="px-4.5 py-4 text-sm text-bodydark2">
                  미답변 문의가 없습니다.
                </li>
              )}
              {!loading &&
                inquiries.map((inquiry) => (
                  <li key={inquiry.inquiryId}>
                    <Link
                      className="flex flex-col gap-1.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                      href="/inquiries"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                          {inquiry.category}
                        </span>
                        <span className="text-xs text-bodydark2">
                          User #{inquiry.userId}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {inquiry.inquiryTitle.length > 24
                          ? inquiry.inquiryTitle.slice(0, 24) + "…"
                          : inquiry.inquiryTitle}
                      </p>
                      <p className="text-xs">
                        {formatRelativeTime(inquiry.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>

            <Link
              href="/inquiries"
              className="border-t border-stroke px-4.5 py-3 text-center text-sm text-primary hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
            >
              문의 관리 전체 보기 →
            </Link>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownMessage;
