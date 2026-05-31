"use client";
import React, { useState } from "react";
import { notificationsApi } from "@/lib/api/notifications";

export default function NotificationClient() {
  const [userId, setUserId] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingUser, setSendingUser] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userMessage.trim()) return;
    setSendingUser(true);
    setSuccessMsg("");
    try {
      await notificationsApi.sendToUser(Number(userId), userMessage);
      setSuccessMsg("알림이 발송되었습니다.");
      setUserId("");
      setUserMessage("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "발송 실패");
    } finally {
      setSendingUser(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    if (!confirm(`전체 활성 사용자에게 공지를 발송하시겠습니까?\n\n"${broadcastMessage}"`)) return;
    setSendingBroadcast(true);
    setSuccessMsg("");
    try {
      const result = await notificationsApi.broadcast(broadcastMessage);
      setSuccessMsg(`공지가 ${result.recipientCount}명에게 발송되었습니다.`);
      setBroadcastMessage("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "발송 실패");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">알림 발송</h1>
      </div>

      {successMsg && (
        <div className="mb-4 rounded bg-meta-3/10 px-4 py-3 text-sm text-meta-3">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 개인 알림 */}
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">특정 사용자 알림</h2>
          <form onSubmit={handleSendUser}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">수신 사용자 ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder="사용자 ID 입력"
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">메시지 (최대 200자)</label>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                required
                maxLength={200}
                rows={4}
                placeholder="알림 메시지를 입력하세요"
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
              <div className="text-right text-xs text-gray-400">{userMessage.length}/200</div>
            </div>
            <button
              type="submit"
              disabled={sendingUser}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {sendingUser ? "발송 중..." : "발송"}
            </button>
          </form>
        </div>

        {/* 전체 공지 */}
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">전체 공지 발송</h2>
          <div className="mb-3 rounded bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            전체 활성 사용자에게 시스템 알림이 발송됩니다. 신중하게 사용하세요.
          </div>
          <form onSubmit={handleBroadcast}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">공지 메시지 (최대 200자)</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                maxLength={200}
                rows={4}
                placeholder="전체 공지 메시지를 입력하세요"
                className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
              />
              <div className="text-right text-xs text-gray-400">{broadcastMessage.length}/200</div>
            </div>
            <button
              type="submit"
              disabled={sendingBroadcast}
              className="rounded bg-meta-1 px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {sendingBroadcast ? "발송 중..." : "전체 발송"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
