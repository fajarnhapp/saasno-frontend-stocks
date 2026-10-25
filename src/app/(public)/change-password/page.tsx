import ForceChangePasswordComponent from "@/component/password/ForceChangePasswordComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saasno - Change Password",
  description: "Change Password",
};

export default function Page() {
  return <ForceChangePasswordComponent />;
}
