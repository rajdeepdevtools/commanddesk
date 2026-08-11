"use client";

import { useMemo } from "react";
import { defineAbilityFor } from "@/lib/rbac/ability";
import { AbilityProvider as CaslAbilityProvider } from "@casl/react";

export function AbilityProvider({ 
  children,
  role = "GUEST" 
}: { 
  children: React.ReactNode;
  role?: string;
}) {
  const ability = useMemo(() => defineAbilityFor(role), [role]);

  return (
    <CaslAbilityProvider value={ability}>
      {children}
    </CaslAbilityProvider>
  );
}
