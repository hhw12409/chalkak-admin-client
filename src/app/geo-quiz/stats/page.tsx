import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GeoQuizStatsClient from "@/components/GeoQuiz/GeoQuizStatsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 포토 어디게 통계" };

export default function GeoQuizStatsPage() {
  return (
    <DefaultLayout>
      <GeoQuizStatsClient />
    </DefaultLayout>
  );
}
