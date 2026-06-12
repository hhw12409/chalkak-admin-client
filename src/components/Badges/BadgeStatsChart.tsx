"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { BadgeStats } from "@/types/badge";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  stats: BadgeStats;
}

export default function BadgeStatsChart({ stats }: Props) {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      toolbar: { show: false },
      type: "line",
    },
    xaxis: {
      categories: stats.last7Days.map((d) => d.date.slice(5)),
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    colors: ["#3C50E0"],
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (v) => Math.round(v).toString(),
      },
    },
    tooltip: {
      y: { formatter: (v) => `${v} 건` },
    },
  };

  const series = [
    {
      name: "발급 수",
      data: stats.last7Days.map((d) => d.count),
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-black dark:text-white">
          발급 통계
        </h4>
      </div>

      <div className="mb-6">
        <div className="text-xs text-gray-500">총 발급 수</div>
        <div className="mt-1 text-3xl font-bold text-black dark:text-white">
          {stats.totalAwardedCount.toLocaleString()}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-body dark:text-bodydark">
          최근 7일 발급 추이
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={260}
        />
      </div>
    </div>
  );
}
