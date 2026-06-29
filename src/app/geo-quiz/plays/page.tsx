import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GeoQuizPlayClient from "@/components/GeoQuiz/GeoQuizPlayClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 포토 어디게 플레이 관리" };

export default function GeoQuizPlayPage() {
  return (
    <DefaultLayout>
      <GeoQuizPlayClient />
    </DefaultLayout>
  );
}
