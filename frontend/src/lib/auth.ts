import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedWorkspaceDemoData } from "@/lib/saas/seed-workspace-demo-data";

export type AppSession = {
  user: {
    id: string;
    authUserId: string;
    email: string;
    name: string;
    image: string | null;
    role: string;
    companyId: string | null;
    companyName: string | null;
  };
} | null;

/**
 * Supabase-backed session adapter. It preserves the old `await auth()` call
 * shape so existing pages and route handlers stay compatible while identity
 * and sessions are handled by Supabase Auth.
 *
 * Wrapped in React `cache()` so that repeated `auth()` calls within a single
 * request are deduplicated. A page that renders the sidebar, the header and
 * calls `authorize()` used to run this whole Supabase + Prisma sequence once
 * per call site.
 */
export const auth = cache(async function auth(): Promise<AppSession> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const isDemoSession = cookieStore.get("commanddesk_demo_session")?.value === "true";
  const hasAuthCookie =
    isDemoSession ||
    allCookies.some(
      (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
    );

  if (!hasAuthCookie) {
    return null;
  }

  const isPlaceholderSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project-ref");

  let supabase;
  let data;
  let error;
  try {
    if (!isPlaceholderSupabase) {
      supabase = await createClient();
      const result = await supabase.auth.getUser();
      data = result.data;
      error = result.error;
    }
  } catch (err) {
    console.warn("[Auth] Failed to retrieve Supabase user:", err);
  }

  // If in demo session or placeholder Supabase mode, provide Master Admin profile
  if (isDemoSession || isPlaceholderSupabase || !data?.user?.email) {
    if (isDemoSession || isPlaceholderSupabase) {
      const demoEmail = cookieStore.get("commanddesk_demo_email")?.value || "rajdeepdevtools@gmail.com";

      let dbUser = null;
      try {
        dbUser = await prisma.user.findFirst({
          where: { email: { equals: demoEmail, mode: "insensitive" } },
          select: {
            id: true,
            authUserId: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      } catch (dbErr) {
        // Fallback if DB is disconnected
      }

      const demoName = dbUser
        ? `${dbUser.firstName} ${dbUser.lastName}`.trim()
        : cookieStore.get("commanddesk_demo_name")?.value || "Master Super Owner Admin";
      const demoImage = dbUser?.avatarUrl ?? cookieStore.get("commanddesk_demo_image")?.value ?? null;
      const demoCompanyName = dbUser?.company?.name || cookieStore.get("commanddesk_demo_company_name")?.value || "CommandDesk Enterprise OS";

      return {
        user: {
          id: dbUser?.id || "master-super-admin-id",
          authUserId: dbUser?.authUserId || "master-super-admin-auth-id",
          email: demoEmail,
          name: demoName,
          image: demoImage,
          role: dbUser?.role || "SUPER_ADMIN",
          companyId: dbUser?.companyId || "demo-company-id",
          companyName: demoCompanyName,
        },
      };
    }
    return null;
  }


  let profile = await prisma.user.findFirst({
    where: {
      OR: [
        { authUserId: data.user.id },
        { email: data.user.email },
      ],
    },
    select: {
      id: true,
      authUserId: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    const rawName =
      (data.user.user_metadata?.full_name as string | undefined) ??
      data.user.email.split("@")[0];
    const [firstName, ...lastNameParts] = rawName.trim().split(/\s+/);
    const slugBase = data.user.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const companySlug = `${slugBase || "workspace"}-${data.user.id.slice(0, 8)}`;

    try {
      profile = await prisma.$transaction(async (tx) => {
        let company = await tx.company.findFirst({
          where: {
            OR: [
              { slug: companySlug },
              { email: data.user.email },
            ],
          },
        });

        if (!company) {
          company = await tx.company.create({
            data: {
              name: `${firstName || "My"}'s Workspace`,
              slug: companySlug,
              email: data.user.email,
              subscriptionPlan: "free",
              subscription: {
                create: {
                  plan: "FREE",
                  status: "TRIALING",
                  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
              },
            },
          });
        }

        const existingUser = await tx.user.findFirst({
          where: {
            OR: [
              { authUserId: data.user.id },
              { email: data.user.email },
            ],
          },
          select: {
            id: true,
            authUserId: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (existingUser) {
          return existingUser;
        }

        return tx.user.create({
          data: {
            authUserId: data.user.id,
            email: data.user.email!,
            firstName: firstName || "User",
            lastName: lastNameParts.join(" "),
            role: "ORGANIZATION_OWNER",
            emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
            companyId: company.id,
            memberships: {
              create: {
                companyId: company.id,
                role: "ORGANIZATION_OWNER",
                isDefault: true,
              },
            },
          },
          select: {
            id: true,
            authUserId: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      if (profile.company?.id) {
        await seedWorkspaceDemoData(profile.company.id, profile.id).catch((err) => {
          console.warn("Failed to seed demo data (ignoring):", err);
        });
      }
    } catch (err) {
      // Fallback in case of concurrent execution
      profile = await prisma.user.findFirst({
        where: {
          OR: [
            { authUserId: data.user.id },
            { email: data.user.email },
          ],
        },
        select: {
          id: true,
          authUserId: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!profile) {
        throw err;
      }
    }
  }


  if (!profile.isActive) return null;

  if (!profile.authUserId) {
    await prisma.user.update({
      where: { id: profile.id },
      data: { authUserId: data.user.id, emailVerified: new Date() },
    });
  }

  const requestedCompanyId = cookieStore.get("commanddesk_company_id")?.value;


  let memberships: Array<{
    companyId: string;
    role: string;
    company: { id: string; name: string };
  }> = [];

  if (profile.role !== "SUPER_ADMIN") {
    try {
      memberships = await prisma.companyMembership.findMany({
        where: {
          userId: profile.id,
          status: "ACTIVE",
        },
        select: {
          companyId: true,
          role: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2021"
        )
      ) {
        throw error;
      }
    }
  }

  const activeMembership =
    memberships.find((item) => item.companyId === requestedCompanyId) ??
    memberships[0];
  let company = activeMembership?.company ?? profile.company;

  if (!company) {
    let defaultCompany = await prisma.company.findFirst({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: {
          name: "CommandDesk Workspace",
          slug: `workspace-${profile.id.slice(0, 8)}`,
          email: profile.email,
        },
        select: { id: true, name: true },
      });
      await seedWorkspaceDemoData(defaultCompany.id, profile.id);
    }

    await prisma.user.update({
      where: { id: profile.id },
      data: { companyId: defaultCompany.id },
    }).catch(() => null);

    await prisma.companyMembership.upsert({
      where: {
        companyId_userId: {
          companyId: defaultCompany.id,
          userId: profile.id,
        },
      },
      create: {
        companyId: defaultCompany.id,
        userId: profile.id,
        role: profile.role || "ORGANIZATION_OWNER",
        status: "ACTIVE",
        isDefault: true,
      },
      update: {
        status: "ACTIVE",
      },
    }).catch(() => null);

    company = defaultCompany;
  }

  return {
    user: {
      id: profile.id,
      authUserId: data.user.id,
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      image: profile.avatarUrl,
      role: activeMembership?.role ?? profile.role,
      companyId: company.id,
      companyName: company.name,
    },
  };
});
