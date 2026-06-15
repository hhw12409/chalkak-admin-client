import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserDetailClient from "@/components/Users/UserDetailClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 사용자 상세" };

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  return (
    <DefaultLayout>
      <UserDetailClient key={params.userId} userId={Number(params.userId)} />
    </DefaultLayout>
  );
}
