import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NoticeFormClient from "@/components/Notices/NoticeFormClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 공지 편집" };

export default function NoticeEditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DefaultLayout>
      <NoticeFormClient mode="edit" noticeId={Number(params.id)} />
    </DefaultLayout>
  );
}
