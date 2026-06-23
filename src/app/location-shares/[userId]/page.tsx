import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LocationShareDetailClient from "@/components/LocationShares/LocationShareDetailClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 위치공유 상세" };

export default function LocationShareDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <DefaultLayout>
      <LocationShareDetailClient key={params.userId} userId={Number(params.userId)} />
    </DefaultLayout>
  );
}
