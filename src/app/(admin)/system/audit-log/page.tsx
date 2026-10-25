import AuditLogComponent from "@/component/audit-log";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Audit Log",
    description: "Audit log application",
};

export default function AuditLog() {

    return (
        <AuditLogComponent />
    );
}
