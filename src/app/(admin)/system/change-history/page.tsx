import ChangeHistoryComponent from "@/component/history/ChangeHistoryComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Change History",
    description: "What was changed, by whom",
};

export default function Page() {
    return <ChangeHistoryComponent />;
}
