import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NoticeFormClient from "@/components/Notices/NoticeFormClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 공지 등록" };

export default function NoticeNewPage() {
  return (
    <DefaultLayout>
      <NoticeFormClient mode="create" />
    </DefaultLayout>
  );
}
