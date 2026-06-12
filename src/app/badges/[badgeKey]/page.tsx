import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BadgeDetailClient from "@/components/Badges/BadgeDetailClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 뱃지 상세" };

interface Props {
  params: { badgeKey: string };
}

export default function BadgeDetailPage({ params }: Props) {
  const badgeKey = decodeURIComponent(params.badgeKey);
  return (
    <DefaultLayout>
      <BadgeDetailClient badgeKey={badgeKey} />
    </DefaultLayout>
  );
}
