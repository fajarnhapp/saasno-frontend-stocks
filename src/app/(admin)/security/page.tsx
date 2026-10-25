import SecurityComponent from "@/component/security";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Keamanan",
    description: "Security application",
};

export default function Security() {
    return (
        <SecurityComponent />
    );
}
