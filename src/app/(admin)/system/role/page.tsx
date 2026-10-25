import RoleComponent from "@/component/role";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Role",
    description: "Role application",
};

export default function Role() {

    return (
        <RoleComponent />
    );
}
