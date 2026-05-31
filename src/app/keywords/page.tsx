import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import KeywordClient from "@/components/Keywords/KeywordClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 키워드 관리" };

export default function KeywordsPage() {
  return (
    <DefaultLayout>
      <KeywordClient />
    </DefaultLayout>
  );
}
