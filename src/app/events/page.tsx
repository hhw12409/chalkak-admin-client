import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EventListClient from "@/components/Events/EventListClient";

export const metadata: Metadata = {
  title: "찰칵 어드민 - 이벤트 관리",
};

export default function EventsPage() {
  return (
    <DefaultLayout>
      <EventListClient />
    </DefaultLayout>
  );
}
