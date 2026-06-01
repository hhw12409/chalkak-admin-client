import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CommentListClient from "@/components/Comments/CommentListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 댓글 관리" };

export default function CommentsPage() {
  return (
    <DefaultLayout>
      <CommentListClient />
    </DefaultLayout>
  );
}
