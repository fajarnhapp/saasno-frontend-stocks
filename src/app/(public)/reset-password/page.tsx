import ResetPasswordComponent from "@/component/password/ResetPasswordComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saasno - Reset Password",
  description: "Reset password",
  // The URL carries a one-time token: keep it out of the Referer sent to other sites.
  referrer: "no-referrer",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <ResetPasswordComponent token={Array.isArray(token) ? token[0] : token ?? ""} />;
}
