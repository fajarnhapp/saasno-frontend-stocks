import LoginComponent from "@/component/login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saasno - Login",
  description: "Login application",
};

export default function Login() {
  return (
    <LoginComponent />
  );
}
