import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MissionListClient from "@/components/Missions/MissionListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 미션 관리" };

export default function MissionsPage() {
  return (
    <DefaultLayout>
      <MissionListClient />
    </DefaultLayout>
  );
}
