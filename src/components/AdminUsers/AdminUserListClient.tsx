"use client";
import React, { useEffect, useState } from "react";
import { adminUsersApi } from "@/lib/api/adminUsers";
import { AdminUserAccount, AdminRole, AdminUserStatus } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import MaskedField from "@/components/common/MaskedField";
import UnmaskModal from "@/components/common/UnmaskModal";

const roleLabel: Record<AdminRole, string> = {
  VIEWER: "조회자",
  OPERATOR: "운영자",
  ADMIN: "관리자",
};

const statusLabel: Record<AdminUserStatus, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지",
  REVOKED: "취소",
};

const roles: AdminRole[] = ["VIEWER", "OPERATOR", "ADMIN"];
const statuses: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "REVOKED"];

const emptyForm = () => ({ username: "", password: "", email: "", name: "", role: "VIEWER" as AdminRole });

export default function AdminUserListClient() {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState<AdminUserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [unmaskTarget, setUnmaskTarget] = useState<{ adminId: number; field: string } | null>(null);

  const load = () => {
    setLoading(true);
    adminUsersApi
      .listAdmins()
      .then(setAdmins)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminUsersApi.createAdmin(form);
      setShowCreate(false);
      setForm(emptyForm());
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (targetAdmin: AdminUserAccount, newRole: AdminRole) => {
    if (targetAdmin.adminId === admin?.adminId) {
      alert("자신의 역할은 변경할 수 없습니다.");
      return;
    }
    try {
      const updated = await adminUsersApi.updateRole(targetAdmin.adminId, newRole);
      setAdmins((prev) => prev.map((a) => (a.adminId === updated.adminId ? updated : a)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "역할 변경 실패");
    }
  };

  const handleStatusChange = async (targetAdmin: AdminUserAccount, newStatus: AdminUserStatus) => {
    if (targetAdmin.adminId === admin?.adminId) {
      alert("자신의 상태는 변경할 수 없습니다.");
      return;
    }
    if (!confirm(`${targetAdmin.name}의 상태를 "${statusLabel[newStatus]}"로 변경하시겠습니까?`)) return;
    try {
      const updated = await adminUsersApi.updateStatus(targetAdmin.adminId, newStatus);
      setAdmins((prev) => prev.map((a) => (a.adminId === updated.adminId ? updated : a)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "상태 변경 실패");
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-400">불러오는 중...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">운영자 계정 관리</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
        >
          + 계정 추가
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">아이디</th>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">이메일</th>
                <th className="px-4 py-3 text-left font-medium">역할</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">최근 로그인</th>
                <th className="px-4 py-3 text-left font-medium">최근 IP</th>
                <th className="px-4 py-3 text-left font-medium">생성일</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">운영자 없음</td></tr>
              ) : (
                admins.map((a) => {
                  const isSelf = a.adminId === admin?.adminId;
                  return (
                    <tr key={a.adminId} className={`border-b border-stroke dark:border-strokedark ${isSelf ? "bg-primary/5" : "hover:bg-gray-1 dark:hover:bg-meta-4"}`}>
                      <td className="px-4 py-3 text-gray-500">{a.adminId}</td>
                      <td className="px-4 py-3 font-medium text-black dark:text-white">
                        {a.username}{isSelf && <span className="ml-1 text-xs text-primary">(나)</span>}
                      </td>
                      <td className="px-4 py-3">{a.name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <MaskedField
                          value={a.email}
                          masked={a.emailMasked}
                          onReveal={() => setUnmaskTarget({ adminId: a.adminId, field: "이메일" })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                            a.role === "ADMIN" ? "bg-meta-1/10 text-meta-1" :
                            a.role === "OPERATOR" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                          }`}>{roleLabel[a.role]}</span>
                        ) : (
                          <select
                            value={a.role}
                            onChange={(e) => handleRoleChange(a, e.target.value as AdminRole)}
                            className="rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-boxdark dark:text-white"
                          >
                            {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-meta-3/10 text-meta-3">
                            {statusLabel[a.status]}
                          </span>
                        ) : (
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a, e.target.value as AdminUserStatus)}
                            className={`rounded border px-2 py-1 text-xs dark:bg-boxdark dark:text-white ${
                              a.status === "ACTIVE" ? "border-meta-3/30 dark:border-meta-3/30" :
                              "border-meta-1/30 dark:border-meta-1/30"
                            }`}
                          >
                            {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.lastLoginAt?.slice(0, 16) ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <MaskedField
                          value={a.lastLoginIp ?? "-"}
                          masked={a.lastLoginIpMasked ?? false}
                          onReveal={() => setUnmaskTarget({ adminId: a.adminId, field: "IP 주소" })}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.createdAt?.slice(0, 10)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {unmaskTarget && (
        <UnmaskModal
          targetType="ADMIN_USER"
          targetId={unmaskTarget.adminId}
          fieldLabel={unmaskTarget.field}
          onClose={() => setUnmaskTarget(null)}
          onSuccess={() => {
            setUnmaskTarget(null);
            load();
          }}
        />
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">운영자 계정 추가</h3>
            <form onSubmit={handleCreate}>
              {(["username", "password", "email", "name"] as const).map((field) => (
                <div className="mb-3" key={field}>
                  <label className="mb-1 block text-sm font-medium">
                    {field === "username" ? "아이디" : field === "password" ? "비밀번호" : field === "email" ? "이메일" : "이름"} *
                  </label>
                  <input
                    type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    required
                    className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">역할</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                >
                  {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray-1">취소</button>
                <button type="submit" disabled={submitting}
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60">
                  {submitting ? "생성 중..." : "생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
