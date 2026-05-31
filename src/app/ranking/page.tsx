import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RankingClient from "@/components/Rankings/RankingClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 랭킹 관리" };

export default function RankingPage() {
  return (
    <DefaultLayout>
      <RankingClient />
    </DefaultLayout>
  );
}
