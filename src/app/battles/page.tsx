import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BattlesClient from "@/components/Battles/BattlesClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 사진 배틀 관리" };

export default function BattlesPage() {
  return (
    <DefaultLayout>
      <BattlesClient />
    </DefaultLayout>
  );
}
