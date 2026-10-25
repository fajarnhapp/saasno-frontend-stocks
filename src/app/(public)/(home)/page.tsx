import { redirect } from "next/navigation";
import { PAGE_LOGIN } from "@/utils/endpointUtils";

export default function Home() {
    redirect(PAGE_LOGIN);
}
