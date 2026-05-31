import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReportListClient from "@/components/Reports/ReportListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 신고 관리" };

export default function ReportsPage() {
  return (
    <DefaultLayout>
      <ReportListClient />
    </DefaultLayout>
  );
}
