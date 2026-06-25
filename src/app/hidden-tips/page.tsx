import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import HiddenTipsClient from "@/components/HiddenTips/HiddenTipsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 히든팁 모더레이션" };

export default function HiddenTipsPage() {
  return (
    <DefaultLayout>
      <HiddenTipsClient />
    </DefaultLayout>
  );
}
