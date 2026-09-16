import "server-only";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function provisionAuthUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}) {
  const email = input.email.trim().toLowerCase();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project-ref")) {
      return undefined;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const signup = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    });

    if (signup.data?.user?.id) {
      return signup.data.user.id;
    }
  } catch (err) {
    console.warn("Supabase signUp soft fail, continuing with database user creation:", err);
  }

  try {
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      select id::text
      from auth.users
      where lower(email) = lower(${email})
      limit 1
    `.catch(() => null);
    if (existing && existing[0]?.id) {
      return existing[0].id;
    }
  } catch {
    // Ignore raw query failure
  }

  return undefined;
}
