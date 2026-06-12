import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MissionDetailClient from "@/components/Missions/MissionDetailClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 미션 상세" };

interface Props {
  params: { missionKey: string };
}

export default function MissionDetailPage({ params }: Props) {
  const missionKey = decodeURIComponent(params.missionKey);
  return (
    <DefaultLayout>
      <MissionDetailClient missionKey={missionKey} />
    </DefaultLayout>
  );
}
