import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CampaignsClient from "@/components/Campaigns/CampaignsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 캠페인 관리" };

export default function CampaignsPage() {
  return (
    <DefaultLayout>
      <CampaignsClient />
    </DefaultLayout>
  );
}
