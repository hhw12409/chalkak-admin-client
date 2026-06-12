"use client";
import React from "react";
import Link from "next/link";
import {
  MISSION_TARGET_TYPE_LABELS,
  Mission,
} from "@/types/mission";

interface Props {
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDeactivate: (mission: Mission) => void;
  onReactivate: (mission: Mission) => void;
}

export default function MissionTable({
  missions,
  onEdit,
  onDeactivate,
  onReactivate,
}: Props) {
  if (missions.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">등록된 미션이 없습니다</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
            <th className="px-4 py-3 text-left font-medium">키</th>
            <th className="px-4 py-3 text-left font-medium">제목</th>
            <th className="px-4 py-3 text-left font-medium">목표 타입</th>
            <th className="px-4 py-3 text-left font-medium">목표</th>
            <th className="px-4 py-3 text-left font-medium">보상</th>
            <th className="px-4 py-3 text-left font-medium">정렬</th>
            <th className="px-4 py-3 text-left font-medium">활성</th>
            <th className="px-4 py-3 text-left font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((m) => (
            <tr
              key={m.missionKey}
              className={`border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4 ${
                m.active ? "" : "opacity-60"
              }`}
            >
              <td className="px-4 py-3 font-mono text-xs text-black dark:text-white">
                <Link
                  href={`/missions/${encodeURIComponent(m.missionKey)}`}
                  className="text-primary hover:underline"
                >
                  {m.missionKey}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-black dark:text-white">{m.title}</div>
                <div className="max-w-xs truncate text-xs text-gray-500">
                  {m.description}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {MISSION_TARGET_TYPE_LABELS[m.targetType]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{m.targetCount}</td>
              <td className="px-4 py-3 text-gray-500">{m.rewardPoint}</td>
              <td className="px-4 py-3 text-gray-500">{m.sortOrder}</td>
              <td className="px-4 py-3">
                {m.active ? (
                  <span className="inline-block rounded bg-success/10 px-2 py-0.5 text-xs text-success">
                    활성
                  </span>
                ) : (
                  <span className="inline-block rounded bg-gray-2 px-2 py-0.5 text-xs text-gray-500 dark:bg-meta-4">
                    비활성
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Link
                    href={`/missions/${encodeURIComponent(m.missionKey)}`}
                    className="rounded bg-meta-3 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                  >
                    통계
                  </Link>
                  <button
                    onClick={() => onEdit(m)}
                    className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90"
                  >
                    편집
                  </button>
                  {m.active ? (
                    <button
                      onClick={() => onDeactivate(m)}
                      className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90"
                    >
                      비활성
                    </button>
                  ) : (
                    <button
                      onClick={() => onReactivate(m)}
                      className="rounded bg-success px-2 py-1 text-xs text-white hover:bg-opacity-90"
                    >
                      재활성
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
