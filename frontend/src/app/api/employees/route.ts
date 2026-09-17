import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeService } from "@/lib/services/employee-service";
import { apiError } from "@/lib/saas/api-error";
import { provisionAuthUser } from "@/lib/provision-auth-user";

const SYSTEM_USER_ROLES = new Set([
  "SUPER_ADMIN",
  "ORGANIZATION_OWNER",
  "ADMIN",
  "HR",
  "MANAGER",
  "TEAM_LEAD",
  "EMPLOYEE",
  "FINANCE",
  "SALES",
  "SUPPORT",
  "GUEST",
]);

export async function GET() {
  try {
    const session = await auth();
    let companyId: string | null = null;
    if (session?.user?.companyId) {
      companyId = session.user.companyId;
    }

    const selectEmployeeFields = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      departmentId: true,
      departmentIds: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      employeeProfile: {
        select: {
          designation: true,
          aadhaarNumber: true,
          aadhaarCardUrl: true,
          baseSalary: true,
          bankAccount: true,
          ifscCode: true,
          panNumber: true,
        },
      },
    };

    const employees = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
      select: selectEmployeeFields,
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    if (employees.length === 0) {
      const allEmployees = await prisma.user.findMany({
        where: { isActive: true },
        select: selectEmployeeFields,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      });
      return NextResponse.json(allEmployees);
    }

    return NextResponse.json(employees);
  } catch {
    const fallbackEmployees = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        departmentId: true,
        departmentIds: true,
        department: { select: { id: true, name: true } },
        employeeProfile: { select: { designation: true, aadhaarNumber: true, aadhaarCardUrl: true, baseSalary: true, bankAccount: true, ifscCode: true, panNumber: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }).catch(() => []);
    return NextResponse.json(fallbackEmployees);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    let companyId = session?.user?.companyId;

    if (!companyId) {
      let company = await prisma.company.findFirst({ select: { id: true } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: "CommandDesk Workspace",
            slug: `workspace-${Date.now()}`,
          },
          select: { id: true },
        });
      }
      companyId = company.id;
    }

    const body = (await request.json()) as {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      departmentId?: string;
      departmentIds?: string[];
      designation?: string;
      phone?: string;
      password?: string;
      aadhaarNumber?: string;
      aadhaarCardUrl?: string;
      avatarUrl?: string;
      baseSalary?: number;
      bankAccount?: string;
      ifscCode?: string;
      panNumber?: string;
    };

    if (
      !body.email?.trim() ||
      !body.firstName?.trim() ||
      !body.lastName?.trim() ||
      !body.role?.trim()
    ) {
      return NextResponse.json(
        { error: "Email, first name, last name, and role are required" },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. employee@company.com or name@domain.com)" },
        { status: 400 },
      );
    }
    const rawRole = body.role.trim();
    const isSystemRole = SYSTEM_USER_ROLES.has(rawRole);
    const role = isSystemRole ? rawRole : "EMPLOYEE";
    const designation = body.designation?.trim() || (!isSystemRole ? rawRole : "Team Member");
    const password = body.password || "TempPass123!";

    const rawDeptIds = body.departmentIds && Array.isArray(body.departmentIds)
      ? body.departmentIds
      : body.departmentId ? [body.departmentId] : [];
    const deptIds = rawDeptIds.map((id) => (typeof id === "string" ? id.trim() : "")).filter(Boolean);
    const primaryDeptId = deptIds[0] || (body.departmentId?.trim() ? body.departmentId.trim() : null);

    let authUserId: string | undefined;
    try {
      authUserId = await provisionAuthUser({
        email,
        password,
        fullName: `${body.firstName.trim()} ${body.lastName.trim()}`,
        role,
      });
    } catch {
      // Continue even if auth provision is isolated
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isActive) {
        return NextResponse.json(
          { error: `An employee with email '${email}' already exists in the workspace.` },
          { status: 400 },
        );
      }

      // If user was inactive, reactivate and update their profile
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: body.firstName.trim(),
          lastName: body.lastName.trim(),
          phone: body.phone?.trim() || existingUser.phone,
          avatarUrl: body.avatarUrl || existingUser.avatarUrl,
          role: role as any,
          isActive: true,
          companyId: companyId,
          departmentId: primaryDeptId,
          departmentIds: deptIds,
          employeeProfile: {
            upsert: {
              create: {
                employeeId: `EMP${Date.now()}`,
                designation: designation,
                aadhaarNumber: body.aadhaarNumber?.trim() || undefined,
                aadhaarCardUrl: body.aadhaarCardUrl || undefined,
                baseSalary: body.baseSalary,
                bankAccount: body.bankAccount?.trim() || undefined,
                ifscCode: body.ifscCode?.trim() || undefined,
                panNumber: body.panNumber?.trim() || undefined,
              },
              update: {
                designation: designation,
                ...(body.aadhaarNumber !== undefined ? { aadhaarNumber: body.aadhaarNumber.trim() } : {}),
                ...(body.aadhaarCardUrl !== undefined ? { aadhaarCardUrl: body.aadhaarCardUrl } : {}),
                ...(body.baseSalary !== undefined ? { baseSalary: body.baseSalary } : {}),
                ...(body.bankAccount !== undefined ? { bankAccount: body.bankAccount.trim() } : {}),
                ...(body.ifscCode !== undefined ? { ifscCode: body.ifscCode.trim() } : {}),
                ...(body.panNumber !== undefined ? { panNumber: body.panNumber.trim() } : {}),
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          departmentId: true,
          departmentIds: true,
          department: { select: { id: true, name: true } },
          employeeProfile: { select: { designation: true, aadhaarNumber: true, aadhaarCardUrl: true, baseSalary: true, bankAccount: true, ifscCode: true, panNumber: true } },
        },
      });
      return NextResponse.json(updatedUser, { status: 200 });
    }

    const employee = await EmployeeService.create({
      email,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      role,
      companyId: companyId,
      authUserId,
      departmentId: primaryDeptId || undefined,
      departmentIds: deptIds,
      designation: designation,
      phone: body.phone?.trim(),
      aadhaarNumber: body.aadhaarNumber?.trim() || undefined,
      aadhaarCardUrl: body.aadhaarCardUrl || undefined,
      avatarUrl: body.avatarUrl || undefined,
      baseSalary: body.baseSalary,
      bankAccount: body.bankAccount?.trim() || undefined,
      ifscCode: body.ifscCode?.trim() || undefined,
      panNumber: body.panNumber?.trim() || undefined,
    });

    // Create an activation token for the new employee
    const activationToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: activationToken,
        },
      },
      create: {
        identifier: email,
        token: activationToken,
        expires: expiresAt,
      },
      update: {
        token: activationToken,
        expires: expiresAt,
      },
    }).catch(() => null);

    const responsePayload = {
      ...employee,
      activationToken,
      activationLink: `/auth/activate?email=${encodeURIComponent(email)}&token=${activationToken}`,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/employees error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Unable to create employee", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
