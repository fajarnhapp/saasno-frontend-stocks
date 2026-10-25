import DashboardComponent from "@/component/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Dashboard",
    description: "Dashboard application",
};

export default function Dashboard() {

    return (
        <DashboardComponent />
    );
}
