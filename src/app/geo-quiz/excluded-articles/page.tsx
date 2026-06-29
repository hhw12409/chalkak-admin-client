import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GeoQuizArticleManageClient from "@/components/GeoQuiz/GeoQuizArticleManageClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 포토 어디게 출제 관리" };

export default function GeoQuizExcludedArticlePage() {
  return (
    <DefaultLayout>
      <GeoQuizArticleManageClient />
    </DefaultLayout>
  );
}
