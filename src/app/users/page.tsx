import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserListClient from "@/components/Users/UserListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 사용자 관리" };

export default function UsersPage() {
  return (
    <DefaultLayout>
      <UserListClient />
    </DefaultLayout>
  );
}
