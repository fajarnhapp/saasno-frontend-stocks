import MaintenanceComponent from "@/component/maintenance";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Maintenance",
    description: "Clean up old data",
};

export default function MaintenancePage() {
    return <MaintenanceComponent />;
}
