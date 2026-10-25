import PrivacyPage from "@/component/privacy/PrivacyPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Privacy Policy",
    description: "How personal data is handled",
};

export default function Page() {
    return <PrivacyPage />;
}
