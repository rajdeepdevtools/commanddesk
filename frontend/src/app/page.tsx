import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { getAccessContext } from "@/lib/saas/authorize";
import { prisma } from "@/lib/prisma";


export default async function Home() {
  let role = "EMPLOYEE";
  let user: any = {
    id: "demo",
    firstName: "Employee",
    lastName: "",
    role: "EMPLOYEE",
  };

  try {
    const access = await getAccessContext();
    const dbUser = await prisma.user.findUnique({
      where: { id: access.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
      },
    }).catch(() => null);

    if (access && access.role) {
      role = access.role;
      user = dbUser || {
        id: access.userId,
        email: access.session?.user?.email,
        firstName: access.session?.user?.name || "User",
        lastName: "",
        role: access.role,
      };
    }
  } catch (error) {
    // Fallback for development/demo mode if no valid session
    role = "ORGANIZATION_OWNER";
    user = {
      id: "demo",
      email: "admin@solubrix.com",
      firstName: "Super",
      lastName: "Admin",
      role: "ORGANIZATION_OWNER",
    };
  }

  const isEmployee = role === "EMPLOYEE";

  return (
    <DashboardLayout>
      {isEmployee ? (
        <EmployeeDashboard user={user} />
      ) : (
        <AdminDashboard
          userName={`${user.firstName || "Admin"} ${user.lastName || ""}`.trim()}
          role={role}
        />
      )}
    </DashboardLayout>
  );
}
