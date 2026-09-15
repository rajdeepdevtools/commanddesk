import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    authUserId?: string;
    email: string;
    name: string;
    role: string;
    companyId?: string | null;
    companyName?: string | null;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return next();
    }

    if (supabase) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser?.email) {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ authUserId: authUser.id }, { email: authUser.email.toLowerCase() }] },
          include: { company: { select: { id: true, name: true } } },
        });

        if (dbUser) {
          req.user = {
            id: dbUser.id,
            authUserId: authUser.id,
            email: dbUser.email,
            name: `${dbUser.firstName} ${dbUser.lastName}`,
            role: dbUser.role,
            companyId: dbUser.companyId,
            companyName: dbUser.company?.name || null,
          };
        }
      }
    }

    next();
  } catch (err) {
    console.warn("[Backend Auth Middleware] Error:", err);
    next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access required" });
  }
  next();
}
