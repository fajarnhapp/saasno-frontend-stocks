import UserComponent from "@/component/user";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - User",
    description: "User application",
};

export default function UserPage() {

    return (
        <UserComponent />
    );
}
