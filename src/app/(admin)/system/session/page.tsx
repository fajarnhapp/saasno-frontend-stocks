import SessionList from "@/component/session/SessionList";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Active Sessions",
    description: "Devices currently signed in",
};

export default function SessionPage() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-base font-semibold text-gray-800">Active sessions</h3>
            <p className="mb-4 text-sm text-gray-500">Every device currently signed in. Sign out devices that are lost or unrecognized.</p>
            <SessionList scope="all" />
        </div>
    );
}
