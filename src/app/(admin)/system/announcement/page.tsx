import AnnouncementComponent from "@/component/announcement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Announcement",
    description: "Notices shown to every signed-in user",
};

export default function Page() {
    return <AnnouncementComponent />;
}
