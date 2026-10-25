import ConfigurationComponent from "@/component/configuration";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Configuration",
    description: "Configuration application",
};

export default function Configuration() {

    return (
        <ConfigurationComponent />
    );
}
