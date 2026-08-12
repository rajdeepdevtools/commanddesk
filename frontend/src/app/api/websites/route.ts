import { NextResponse } from "next/server";
import { WebsiteService } from "@/lib/services/website-service";
import { apiError } from "@/lib/saas/api-error";
import { getUserSession } from "@/lib/auth/session";

export async function GET() {
  try {
    // For now we allow any logged in user, in real app check WEBSITES_VIEW
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.companyId) return NextResponse.json({ error: "Company not found" }, { status: 400 });

    const sites = await WebsiteService.getSites(session.user.companyId);
    return NextResponse.json(sites);
  } catch (error) {
    return apiError(error, "Unable to load websites");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const site = await WebsiteService.createSite(body);
    
    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create website");
  }
}
