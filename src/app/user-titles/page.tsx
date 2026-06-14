import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserTitlesClient from "@/components/UserTitles/UserTitlesClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 직책 마스터 관리" };

export default function UserTitlesPage() {
  return (
    <DefaultLayout>
      <UserTitlesClient />
    </DefaultLayout>
  );
}
