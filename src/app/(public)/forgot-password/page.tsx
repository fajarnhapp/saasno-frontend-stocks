import ForgotPasswordComponent from "@/component/password/ForgotPasswordComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saasno - Forgot Password",
  description: "Forgot Password",
};

export default function Page() {
  return <ForgotPasswordComponent />;
}
