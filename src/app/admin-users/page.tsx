import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminUserListClient from "@/components/AdminUsers/AdminUserListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 운영자 계정 관리" };

export default function AdminUsersPage() {
  return (
    <DefaultLayout>
      <AdminUserListClient />
    </DefaultLayout>
  );
}
