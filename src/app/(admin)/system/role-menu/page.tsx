import RoleMenuComponent from "@/component/role-menu";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Role Menu",
    description: "Role Menu application",
};

export default function RoleMenu() {

    return (
        <RoleMenuComponent />
    );
}
