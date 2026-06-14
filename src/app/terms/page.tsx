import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import TermListClient from "@/components/Terms/TermListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 약관 관리" };

export default function TermsPage() {
  return (
    <DefaultLayout>
      <TermListClient />
    </DefaultLayout>
  );
}
