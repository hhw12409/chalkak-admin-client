import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NotificationClient from "@/components/Notifications/NotificationClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 알림 발송" };

export default function NotificationsPage() {
  return (
    <DefaultLayout>
      <NotificationClient />
    </DefaultLayout>
  );
}
