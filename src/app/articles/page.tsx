import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ArticleListClient from "@/components/Articles/ArticleListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 콘텐츠 관리" };

export default function ArticlesPage({
  searchParams,
}: {
  searchParams?: { articleId?: string };
}) {
  const raw = searchParams?.articleId;
  const parsed = raw ? Number(raw) : NaN;
  const initialArticleId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  return (
    <DefaultLayout>
      <ArticleListClient initialArticleId={initialArticleId} />
    </DefaultLayout>
  );
}
