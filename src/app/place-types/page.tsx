import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PlaceTypesClient from "@/components/PlaceTypes/PlaceTypesClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 장소 타입 관리" };

export default function PlaceTypesPage() {
  return (
    <DefaultLayout>
      <PlaceTypesClient />
    </DefaultLayout>
  );
}
