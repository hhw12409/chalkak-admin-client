'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';
import { articlesApi } from '@/lib/api/articles';
import { AdminUser, AdminArticle } from '@/types/admin';

interface SearchResults {
  users: AdminUser[];
  articles: AdminArticle[];
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ users: [], articles: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setIsOpen(false);
      setResults({ users: [], articles: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const [usersRes, articlesRes] = await Promise.all([
          usersApi.getUsers({ keyword: query, size: 3 }),
          articlesApi.getArticles({ keyword: query, size: 3 }),
        ]);
        setResults({
          users: usersRes.content,
          articles: articlesRes.content,
        });
      } catch {
        setResults({ users: [], articles: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleUserClick = (user: AdminUser) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/users/${user.userId}`);
  };

  const handleArticleClick = () => {
    setIsOpen(false);
    setQuery('');
    router.push('/articles');
  };

  const hasResults = results.users.length > 0 || results.articles.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button className="absolute left-0 top-1/2 -translate-y-1/2">
        <svg
          className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
            fill=""
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
            fill=""
          />
        </svg>
      </button>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Type to search..."
        className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
      />

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-72 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:w-125">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !hasResults ? (
            <p className="px-4 py-4 text-sm text-body dark:text-bodydark">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul>
              {results.users.length > 0 && (
                <>
                  <li className="px-4 py-2 text-xs font-semibold uppercase text-body dark:text-bodydark">
                    사용자
                  </li>
                  {results.users.map((user) => (
                    <li key={user.userId}>
                      <button
                        onClick={() => handleUserClick(user)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-2 dark:hover:bg-meta-4"
                      >
                        <span className="text-base">👤</span>
                        <span className="font-medium text-black dark:text-white">
                          {user.nickname}
                        </span>
                        <span className="text-xs text-body dark:text-bodydark">
                          {user.email}
                        </span>
                      </button>
                    </li>
                  ))}
                </>
              )}
              {results.users.length > 0 && results.articles.length > 0 && (
                <li className="border-t border-stroke dark:border-strokedark" />
              )}
              {results.articles.length > 0 && (
                <>
                  <li className="px-4 py-2 text-xs font-semibold uppercase text-body dark:text-bodydark">
                    콘텐츠
                  </li>
                  {results.articles.map((article) => (
                    <li key={article.articleId}>
                      <button
                        onClick={handleArticleClick}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-2 dark:hover:bg-meta-4"
                      >
                        <span className="text-base">📸</span>
                        <span className="flex-1 truncate font-medium text-black dark:text-white">
                          {article.title}
                        </span>
                        {article.authorNickname && (
                          <span className="text-xs text-body dark:text-bodydark">
                            {article.authorNickname}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
