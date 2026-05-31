"use client";
import React, { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api/settings";
import { PlaceType, ArticleType, Board } from "@/types/admin";

type Tab = "place-types" | "article-types" | "boards";

export default function SettingsClient() {
  const [tab, setTab] = useState<Tab>("place-types");
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>([]);
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([settingsApi.getPlaceTypes(), settingsApi.getArticleTypes(), settingsApi.getBoards()])
      .then(([pt, at, b]) => { setPlaceTypes(pt); setArticleTypes(at); setBoards(b); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    setSubmitting(true);
    try {
      if (tab === "place-types") await settingsApi.createPlaceType(inputValue);
      else if (tab === "article-types") await settingsApi.createArticleType(inputValue);
      else await settingsApi.createBoard(inputValue);
      setInputValue("");
      loadAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editValue.trim()) return;
    setSubmitting(true);
    try {
      if (tab === "place-types") await settingsApi.updatePlaceType(id, editValue);
      else if (tab === "article-types") await settingsApi.updateArticleType(id, editValue);
      else await settingsApi.updateBoard(id, editValue);
      setEditId(null);
      setEditValue("");
      loadAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      if (tab === "place-types") await settingsApi.deletePlaceType(id);
      else if (tab === "article-types") await settingsApi.deleteArticleType(id);
      else await settingsApi.deleteBoard(id);
      loadAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  const currentItems = tab === "place-types" ? placeTypes
    : tab === "article-types" ? articleTypes
    : boards;

  const getId = (item: PlaceType | ArticleType | Board) =>
    "typeId" in item ? item.typeId : "articleTypeId" in item ? item.articleTypeId : item.boardId;

  const getName = (item: PlaceType | ArticleType | Board) =>
    "typeName" in item ? item.typeName : "articleType" in item ? item.articleType : item.boardName;

  const tabs: { key: Tab; label: string }[] = [
    { key: "place-types", label: "장소 타입" },
    { key: "article-types", label: "게시글 타입" },
    { key: "boards", label: "게시판" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">시스템 설정</h1>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke dark:border-strokedark">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* 생성 폼 */}
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="새 항목 이름 입력"
              className="flex-1 rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
            />
            <button
              onClick={handleCreate}
              disabled={submitting || !inputValue.trim()}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              추가
            </button>
          </div>

          {loading ? (
            <div className="py-6 text-center text-gray-400">불러오는 중...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">이름</th>
                    <th className="px-4 py-3 text-left font-medium">상태</th>
                    <th className="px-4 py-3 text-left font-medium">생성일</th>
                    <th className="px-4 py-3 text-left font-medium">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">항목 없음</td></tr>
                  ) : (
                    currentItems.map((item) => {
                      const id = getId(item);
                      const name = getName(item);
                      return (
                        <tr key={id} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                          <td className="px-4 py-3 text-gray-500">{id}</td>
                          <td className="px-4 py-3">
                            {editId === id ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUpdate(id)}
                                className="rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
                              />
                            ) : (
                              <span className="font-medium text-black dark:text-white">{name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                              item.status === "ACTIVE" ? "bg-meta-3/10 text-meta-3" : "bg-gray-100 text-gray-500"
                            }`}>
                              {item.status === "ACTIVE" ? "활성" : item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{item.createdAt?.slice(0, 10)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {editId === id ? (
                                <>
                                  <button onClick={() => handleUpdate(id)} disabled={submitting}
                                    className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-60">저장</button>
                                  <button onClick={() => setEditId(null)}
                                    className="rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-1 dark:border-strokedark">취소</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditId(id); setEditValue(name); }}
                                    className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-opacity-90">편집</button>
                                  <button onClick={() => handleDelete(id)}
                                    className="rounded bg-meta-1 px-2 py-1 text-xs text-white hover:bg-opacity-90">삭제</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
