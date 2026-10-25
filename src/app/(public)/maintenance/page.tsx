import MaintenanceNotice from "@/component/maintenance/MaintenanceNotice";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Maintenance",
    description: "The system is under maintenance",
};

export default function MaintenancePage() {
    return <MaintenanceNotice />;
}
