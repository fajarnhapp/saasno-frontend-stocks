import ApplicationSettingComponent from "@/component/application";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Application",
    description: "Name, colour and logo of the application",
};

export default function ApplicationPage() {
    return <ApplicationSettingComponent />;
}
