import EmailTemplateComponent from "@/component/email-template";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Email Template",
    description: "The wording of the emails the app sends",
};

export default function Page() {
    return <EmailTemplateComponent />;
}
