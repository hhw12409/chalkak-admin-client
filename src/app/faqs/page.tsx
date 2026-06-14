import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import FaqListClient from "@/components/Faqs/FaqListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - FAQ 관리" };

export default function FaqsPage() {
  return (
    <DefaultLayout>
      <FaqListClient />
    </DefaultLayout>
  );
}
