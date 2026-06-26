import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ActiveExplorerConfigClient from "@/components/ActiveExplorerConfig/ActiveExplorerConfigClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 활발한 탐험가 기준" };

export default function ActiveExplorerConfigPage() {
  return (
    <DefaultLayout>
      <ActiveExplorerConfigClient />
    </DefaultLayout>
  );
}
