import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CheckinsClient from "@/components/Checkins/CheckinsClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 체크인 모더레이션" };

export default function CheckinsPage() {
  return (
    <DefaultLayout>
      <CheckinsClient />
    </DefaultLayout>
  );
}
