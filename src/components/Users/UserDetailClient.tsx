"use client";
import React, { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/users";
import { AdminUser, UserSanction, SanctionLevel } from "@/types/admin";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E";

const sanctionLevels: { value: SanctionLevel; label: string }[] = [
  { value: "WARNING", label: "경고" },
  { value: "SUSPEND_7D", label: "7일 정지" },
  { value: "SUSPEND_30D", label: "30일 정지" },
  { value: "PERMANENT", label: "영구 정지" },
];

const sanctionStatusLabel: Record<string, string> = {
  ACTIVE: "적용 중",
  EXPIRED: "만료",
  REVOKED: "취소됨",
};

interface Props { userId: number; }

export default function UserDetailClient({ userId }: Props) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sanctions, setSanctions] = useState<UserSanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [level, setLevel] = useState<SanctionLevel>("WARNING");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([usersApi.getUser(userId), usersApi.getUserSanctions(userId)])
      .then(([u, s]) => { setUser(u); setSanctions(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [userId]);

  const handleSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await usersApi.sanctionUser(userId, level, reason);
      setShowModal(false);
      setReason("");
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "제재 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (sanctionId: number) => {
    if (!confirm("이 제재를 취소하시겠습니까?")) return;
    try {
      await usersApi.revokeSanction(userId, sanctionId);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "취소 실패");
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-400">불러오는 중...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">사용자 상세</h1>
      </div>

      <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5 flex items-center gap-5">
          <button
            onClick={() => user.profileImage && setShowImageViewer(true)}
            className={`shrink-0 ${user.profileImage ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.profileImage || DEFAULT_AVATAR}
              alt="프로필 이미지"
              className="h-20 w-20 rounded-full border border-stroke object-cover dark:border-strokedark"
            />
          </button>
          <div>
            <p className="text-lg font-semibold text-black dark:text-white">{user.nickname}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {!user.profileImage && (
              <p className="mt-0.5 text-xs text-gray-400">프로필 이미지 없음</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Info label="ID" value={String(user.userId)} />
          <Info label="닉네임" value={user.nickname} />
          <Info label="이메일" value={user.email} />
          <Info label="역할" value={user.role} />
          <Info label="로그인 타입" value={user.snsType ?? "-"} />
          <Info label="상태" value={user.status} />
          <Info label="비공개 계정" value={user.isPrivate ? "예" : "아니오"} />
          <Info label="가입일" value={user.createdAt?.slice(0, 10)} />
          {user.introduction && <Info label="소개" value={user.introduction} />}
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="font-semibold text-black dark:text-white">제재 이력</h2>
          <button
            onClick={() => setShowModal(true)}
            className="rounded bg-meta-1 px-3 py-1 text-sm text-white hover:bg-opacity-90"
          >
            + 제재 추가
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">수준</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">사유</th>
                <th className="px-4 py-3 text-left font-medium">처리자</th>
                <th className="px-4 py-3 text-left font-medium">만료일</th>
                <th className="px-4 py-3 text-left font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {sanctions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">제재 이력 없음</td></tr>
              ) : (
                sanctions.map((s) => (
                  <tr key={s.sanctionId} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-3">{sanctionLevels.find((l) => l.value === s.level)?.label ?? s.level}</td>
                    <td className="px-4 py-3">{sanctionStatusLabel[s.status] ?? s.status}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{s.reason}</td>
                    <td className="px-4 py-3">{s.adminUsername}</td>
                    <td className="px-4 py-3">{s.expiresAt?.slice(0, 10) ?? "-"}</td>
                    <td className="px-4 py-3">
                      {s.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRevoke(s.sanctionId)}
                          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-meta-4 dark:hover:bg-strokedark"
                        >
                          취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImageViewer && user.profileImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowImageViewer(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.profileImage}
            alt="프로필 이미지 원본"
            className="max-h-[90vh] max-w-[90vw] rounded-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute right-4 top-4 text-white text-3xl leading-none hover:opacity-70"
          >
            &times;
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">제재 추가</h3>
            <form onSubmit={handleSanction}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">제재 수준</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SanctionLevel)}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  {sanctionLevels.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">사유 *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="제재 사유를 입력하세요"
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">
                  취소
                </button>
                <button type="submit" disabled={submitting} className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
                  {submitting ? "처리 중..." : "제재 적용"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="font-medium text-black dark:text-white">{value ?? "-"}</p>
    </div>
  );
}
