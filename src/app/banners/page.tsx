import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BannerListClient from "@/components/Banners/BannerListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 배너 관리" };

export default function BannersPage() {
  return (
    <DefaultLayout>
      <BannerListClient />
    </DefaultLayout>
  );
}
