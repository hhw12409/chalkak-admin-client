import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LocationShareListClient from "@/components/LocationShares/LocationShareListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 위치공유 관리" };

export default function LocationSharesPage() {
  return (
    <DefaultLayout>
      <LocationShareListClient />
    </DefaultLayout>
  );
}
