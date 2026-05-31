import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "찰칵 어드민 - 대시보드",
};

export default function Home() {
  return (
    <DefaultLayout>
      <AdminDashboard />
    </DefaultLayout>
  );
}
