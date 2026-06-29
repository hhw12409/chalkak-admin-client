import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GeoQuizExcludedArticleClient from "@/components/GeoQuiz/GeoQuizExcludedArticleClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 포토 어디게 출제 관리" };

export default function GeoQuizExcludedArticlePage() {
  return (
    <DefaultLayout>
      <GeoQuizExcludedArticleClient />
    </DefaultLayout>
  );
}
