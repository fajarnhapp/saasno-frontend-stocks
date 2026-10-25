import RoleApiComponent from "@/component/role-api";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Role Api",
    description: "Role Api application",
};

export default function RoleApi() {
    return (
        <RoleApiComponent />
    );
}
