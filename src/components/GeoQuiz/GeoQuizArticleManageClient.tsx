"use client";
import React, { useState } from "react";
import GeoQuizExcludedArticleClient from "@/components/GeoQuiz/GeoQuizExcludedArticleClient";
import GeoQuizFeaturedArticleClient from "@/components/GeoQuiz/GeoQuizFeaturedArticleClient";

type Tab = "excluded" | "featured";

/**
 * 포토 어디게 출제 관리 — 2탭 컨테이너.
 * - "출제 제외"(블록리스트) / "출제 지정"(큐레이션 화이트리스트)을 한 페이지에서 토글.
 * - 라우트(/geo-quiz/excluded-articles)·사이드바 메뉴는 불변(같은 진입점).
 */
export default function GeoQuizArticleManageClient() {
  const [tab, setTab] = useState<Tab>("excluded");

  const tabBtn = (key: Tab, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
        tab === key
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-black dark:text-white">
        포토 어디게 출제 관리
      </h1>

      <div className="mb-6 flex gap-1 border-b border-stroke dark:border-strokedark">
        {tabBtn("excluded", "출제 제외")}
        {tabBtn("featured", "출제 지정")}
      </div>

      {tab === "excluded" ? (
        <GeoQuizExcludedArticleClient />
      ) : (
        <GeoQuizFeaturedArticleClient />
      )}
    </div>
  );
}
