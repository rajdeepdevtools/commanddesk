import { prisma } from "@/lib/prisma";
import { EmailService } from "../email/email-service";
import { getWelcomeEmailTemplate } from "../email/templates";

export class EmployeeService {
  static async getAll(companyId: string) {
    return prisma.user.findMany({
      where: { companyId, isActive: true },
      include: {
        department: true,
        employeeProfile: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        employeeProfile: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        attendance: { take: 30, orderBy: { date: "desc" } },
        leaves: { take: 10, orderBy: { createdAt: "desc" } },
        tasks: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
    departmentId?: string;
    departmentIds?: string[];
    designation?: string;
    phone?: string;
    authUserId?: string;
    aadhaarNumber?: string;
    aadhaarCardUrl?: string;
    avatarUrl?: string;
    baseSalary?: number;
    bankAccount?: string;
    ifscCode?: string;
    panNumber?: string;
  }) {
    const newEmployee = await prisma.user.create({
      data: {
        email: data.email,
        authUserId: data.authUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        role: data.role as any,
        companyId: data.companyId,
        departmentId: data.departmentId,
        departmentIds: data.departmentIds || (data.departmentId ? [data.departmentId] : []),
        employeeProfile: {
          create: {
            employeeId: `EMP${Date.now()}`,
            designation: data.designation,
            aadhaarNumber: data.aadhaarNumber,
            aadhaarCardUrl: data.aadhaarCardUrl,
            baseSalary: data.baseSalary,
            bankAccount: data.bankAccount,
            ifscCode: data.ifscCode,
            panNumber: data.panNumber,
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
      },
    });

    // Send Welcome Email
    if (newEmployee.email) {
      EmailService.sendMail({
        to: newEmployee.email,
        subject: `Welcome to CommandDesk, ${newEmployee.firstName}! 🎉`,
        html: getWelcomeEmailTemplate(newEmployee.firstName, newEmployee.role),
      }).catch(console.error); // Do not block the request if email fails
    }

    return newEmployee;
  }

  static async update(id: string, data: any) {
    const { designation, departmentId, departmentIds, aadhaarNumber, aadhaarCardUrl, avatarUrl, baseSalary, bankAccount, ifscCode, panNumber, ...userData } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        departmentId: departmentId === "" ? null : departmentId,
        ...(departmentIds !== undefined ? { departmentIds } : {}),
        employeeProfile: {
          upsert: {
            create: {
              employeeId: `EMP${Date.now()}`,
              designation,
              aadhaarNumber,
              aadhaarCardUrl,
              baseSalary,
              bankAccount,
              ifscCode,
              panNumber,
            },
            update: {
              ...(designation !== undefined ? { designation } : {}),
              ...(aadhaarNumber !== undefined ? { aadhaarNumber } : {}),
              ...(aadhaarCardUrl !== undefined ? { aadhaarCardUrl } : {}),
              ...(baseSalary !== undefined ? { baseSalary } : {}),
              ...(bankAccount !== undefined ? { bankAccount } : {}),
              ...(ifscCode !== undefined ? { ifscCode } : {}),
              ...(panNumber !== undefined ? { panNumber } : {}),
            },
          },
        },
      },
      include: { department: true, employeeProfile: true },
    });
  }

  static async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async getStats(companyId: string) {
    const [total, byDepartment, recent] = await Promise.all([
      prisma.user.count({ where: { companyId, isActive: true } }),
      prisma.user.groupBy({
        by: ["departmentId"],
        where: { companyId, isActive: true },
        _count: true,
      }),
      prisma.user.findMany({
        where: { companyId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          department: { select: { name: true } },
        },
      }),
    ]);
    return { total, byDepartment, recent };
  }
}
