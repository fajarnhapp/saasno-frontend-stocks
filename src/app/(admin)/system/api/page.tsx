import ApiComponent from "@/component/api";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Api",
    description: "Api application",
};

export default function Api() {

    return (
        <ApiComponent />
    );
}
