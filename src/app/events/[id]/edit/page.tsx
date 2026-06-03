import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EventFormClient from "@/components/Events/EventFormClient";

export const metadata: Metadata = {
  title: "찰칵 어드민 - 이벤트 편집",
};

export default function EventEditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DefaultLayout>
      <EventFormClient mode="edit" eventId={Number(params.id)} />
    </DefaultLayout>
  );
}
