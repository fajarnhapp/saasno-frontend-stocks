import LoginHistoryComponent from "@/component/history/LoginHistoryComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Login History",
    description: "Sign-in attempts of all users",
};

export default function Page() {
    return <LoginHistoryComponent />;
}
