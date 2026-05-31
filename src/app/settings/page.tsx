import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SettingsClient from "@/components/Settings/SettingsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 시스템 설정" };

export default function SettingsPage() {
  return (
    <DefaultLayout>
      <SettingsClient />
    </DefaultLayout>
  );
}
