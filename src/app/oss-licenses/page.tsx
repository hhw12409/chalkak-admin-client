import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import OssLicenseListClient from "@/components/OssLicenses/OssLicenseListClient";

export const metadata: Metadata = { title: "찰칵 어드민 - OSS 라이선스 관리" };

export default function OssLicensesPage() {
  return (
    <DefaultLayout>
      <OssLicenseListClient />
    </DefaultLayout>
  );
}
