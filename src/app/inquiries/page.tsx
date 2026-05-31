import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import InquiryListClient from "@/components/Inquiries/InquiryListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - 문의 관리" };

export default function InquiriesPage() {
  return (
    <DefaultLayout>
      <InquiryListClient />
    </DefaultLayout>
  );
}
