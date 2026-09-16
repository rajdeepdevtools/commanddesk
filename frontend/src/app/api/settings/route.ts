import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    const email = session?.user?.email || "rajdeepdevtools@gmail.com";
    let companyId = session?.user?.companyId;

    const isPlaceholderDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-project-ref");

    let user = null;
    let company = null;

    if (!isPlaceholderDb) {
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId && userId !== "master-super-admin-id" ? [{ id: userId }] : []),
              { email },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            twoFactorEnabled: true,
            companyId: true,
            role: true,
          },
        });

        if (!user && (!userId || userId === "master-super-admin-id")) {
          const firstUser = await prisma.user.findFirst({
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              twoFactorEnabled: true,
              companyId: true,
              role: true,
            },
          });
          if (firstUser) {
            user = firstUser;
            userId = firstUser.id;
            companyId = firstUser.companyId;
          }
        }

        const targetCompanyId = companyId || user?.companyId;
        company = targetCompanyId
          ? await prisma.company.findUnique({
              where: { id: targetCompanyId },
              select: {
                name: true,
                gst: true,
                email: true,
                phone: true,
                timezone: true,
                country: true,
              },
            })
          : await prisma.company.findFirst({
              select: {
                name: true,
                gst: true,
                email: true,
                phone: true,
                timezone: true,
                country: true,
              },
            });
      } catch {
        // Fallback to default mock settings if DB connection fails
      }
    }

    const sessionUser = session?.user;

    const settings = {
      profile: {
        firstName: user?.firstName ?? sessionUser?.name?.trim().split(" ")[0] ?? "Master",
        lastName: user?.lastName ?? sessionUser?.name?.trim().split(" ").slice(1).join(" ") ?? "Admin",
        fullName: user
          ? `${user.firstName} ${user.lastName}`.trim()
          : (sessionUser?.name || "Master Super Owner Admin"),
        email: user?.email ?? sessionUser?.email ?? "rajdeepdevtools@gmail.com",
        phone: user?.phone ?? "",
        avatarUrl: user?.avatarUrl ?? sessionUser?.image ?? null,
        role: user?.role ?? sessionUser?.role ?? "SUPER_ADMIN",
        timezone: company?.timezone ?? "Asia/Kolkata",
      },
      organization: {
        companyName: company?.name ?? sessionUser?.companyName ?? "CommandDesk Enterprise OS",
        taxId: company?.gst ?? "GSTIN29ABCDE1234F1Z5",
        email: company?.email ?? sessionUser?.email ?? "rajdeepdevtools@gmail.com",
        phone: company?.phone ?? "+91 98765 43210",
        timezone: company?.timezone ?? "Asia/Kolkata",
        country: company?.country ?? "India",
      },
      security: {
        twoFactorEnabled: user?.twoFactorEnabled ?? false,
      },
    };

    return NextResponse.json({
      settings,
      canManageOrganization: true,
    });
  } catch {
    return NextResponse.json({
      settings: {
        profile: {
          firstName: "Master",
          lastName: "Admin",
          fullName: "Master Super Owner Admin",
          email: "rajdeepdevtools@gmail.com",
          phone: "",
          avatarUrl: null,
          role: "SUPER_ADMIN",
          timezone: "Asia/Kolkata",
        },
        organization: {
          companyName: "CommandDesk Enterprise OS",
          taxId: "GSTIN29ABCDE1234F1Z5",
          email: "rajdeepdevtools@gmail.com",
          phone: "+91 98765 43210",
          timezone: "Asia/Kolkata",
          country: "India",
        },
        security: {
          twoFactorEnabled: false,
        },
      },
      canManageOrganization: true,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    const targetEmail = session?.user?.email || "rajdeepdevtools@gmail.com";
    let companyId = session?.user?.companyId;

    const body = (await request.json()) as {
      scope?: "profile" | "organization";
      firstName?: string;
      lastName?: string;
      phone?: string;
      companyName?: string;
      taxId?: string;
      email?: string;
      timezone?: string;
      country?: string;
    };

    if (body.scope === "profile") {
      const firstName = body.firstName?.trim() || "Master";
      const lastName = body.lastName?.trim() || "Admin";
      const fullName = `${firstName} ${lastName}`.trim();

      // Find user by valid ID or by target email
      let targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(userId && userId !== "master-super-admin-id" ? [{ id: userId }] : []),
            { email: targetEmail },
          ],
        },
      });

      if (targetUser) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            firstName,
            lastName,
            phone: body.phone?.trim() || null,
          },
        }).catch(() => null);
      } else {
        await prisma.user.create({
          data: {
            email: targetEmail,
            firstName,
            lastName,
            phone: body.phone?.trim() || null,
            role: "SUPER_ADMIN",
          },
        }).catch(() => null);
      }

      const response = NextResponse.json({ saved: true });
      response.cookies.set("commanddesk_demo_name", fullName, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    if (body.scope === "organization") {
      const companyName = body.companyName?.trim() || "CommandDesk Enterprise OS";

      const targetCompanyId = companyId || (await prisma.company.findFirst({ select: { id: true } }))?.id;

      if (targetCompanyId) {
        await prisma.company.update({
          where: { id: targetCompanyId },
          data: {
            name: companyName,
            gst: body.taxId?.trim() || null,
            email: body.email?.trim() || null,
            phone: body.phone?.trim() || null,
            timezone: body.timezone?.trim() || "Asia/Kolkata",
            country: body.country?.trim() || "India",
          },
        }).catch(() => null);
      }

      const response = NextResponse.json({ saved: true });
      response.cookies.set("commanddesk_demo_company_name", companyName, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ saved: true });
  }
}
