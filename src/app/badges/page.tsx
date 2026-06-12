import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BadgeGridClient from "@/components/Badges/BadgeGridClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 뱃지 관리" };

export default function BadgesPage() {
  return (
    <DefaultLayout>
      <BadgeGridClient />
    </DefaultLayout>
  );
}
