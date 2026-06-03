import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NoticeListClient from "@/components/Notices/NoticeListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 공지사항 관리" };

export default function NoticesPage() {
  return (
    <DefaultLayout>
      <NoticeListClient />
    </DefaultLayout>
  );
}
