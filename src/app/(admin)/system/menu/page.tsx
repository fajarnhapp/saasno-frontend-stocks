import MenuComponent from "@/component/menu";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saasno - Menu",
    description: "Menu application",
};

export default function Menu() {

    return (
        <MenuComponent />
    );
}
