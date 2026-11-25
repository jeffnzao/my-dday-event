import type { Metadata } from "next";
import { PasswordReset } from "@/components/admin/PasswordReset";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

export default function Page() {
  return <PasswordReset />;
}
