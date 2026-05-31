import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AuditLogListClient from "@/components/AuditLogs/AuditLogListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 감사 로그" };

export default function AuditLogsPage() {
  return (
    <DefaultLayout>
      <AuditLogListClient />
    </DefaultLayout>
  );
}
