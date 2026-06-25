import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RegionsClient from "@/components/Regions/RegionsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 지역 마스터 관리" };

export default function RegionsPage() {
  return (
    <DefaultLayout>
      <RegionsClient />
    </DefaultLayout>
  );
}
