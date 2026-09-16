import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  if (!(await getAdminSession())) redirect("/dashboard");
  return <AdminPanel />;
}
