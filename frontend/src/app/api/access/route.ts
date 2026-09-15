import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/saas/authorize";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const access = await getAccessContext();
    const user = await prisma.user.findUnique({
      where: { id: access.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        departmentIds: true,
        department: { select: { id: true, name: true } },
        employeeProfile: {
          select: {
            designation: true,
            joiningDate: true,
            workMode: true,
            baseSalary: true,
            aadhaarNumber: true,
            aadhaarCardUrl: true,
          },
        },
      },
    }).catch(() => null);

    return NextResponse.json({
      companyId: access.companyId,
      role: access.role,
      permissions: access.permissions,
      user: user || {
        id: access.userId,
        email: access.session.user.email,
        firstName: access.session.user.name || "User",
        lastName: "",
        role: access.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized access" },
      { status: 401 }
    );
  }
}

