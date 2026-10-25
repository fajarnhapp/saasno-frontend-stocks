import ForceTwoFactorComponent from "@/component/password/ForceTwoFactorComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saasno - Two-Factor Setup",
  description: "Set up two-factor authentication",
};

export default function Page() {
  return <ForceTwoFactorComponent />;
}
