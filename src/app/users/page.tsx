import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (user && isAdminRole(user.role)) {
    redirect("/admin/users");
  }
  redirect("/");
}
