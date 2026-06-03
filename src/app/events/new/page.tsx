import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EventFormClient from "@/components/Events/EventFormClient";

export const metadata: Metadata = {
  title: "찰칵 어드민 - 이벤트 등록",
};

export default function EventNewPage() {
  return (
    <DefaultLayout>
      <EventFormClient mode="create" />
    </DefaultLayout>
  );
}
