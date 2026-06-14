import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PopularRegionListClient from "@/components/PopularRegions/PopularRegionListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 인기 지역 관리" };

export default function PopularRegionsPage() {
  return (
    <DefaultLayout>
      <PopularRegionListClient />
    </DefaultLayout>
  );
}
