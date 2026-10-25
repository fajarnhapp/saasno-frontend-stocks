import PrivacyAdmin from "@/component/privacy/PrivacyAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Privacy Policy",
    description: "Edit the privacy policy and handle account deletion requests",
};

export default function Page() {
    return <PrivacyAdmin />;
}
