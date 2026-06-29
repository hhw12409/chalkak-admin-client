import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GeoQuizConfigClient from "@/components/GeoQuiz/GeoQuizConfigClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 포토 어디게 설정" };

export default function GeoQuizConfigPage() {
  return (
    <DefaultLayout>
      <GeoQuizConfigClient />
    </DefaultLayout>
  );
}
