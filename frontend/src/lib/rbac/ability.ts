import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";
import { Permission, permissionsForRole } from "@/lib/saas/permissions";

// Actions are fixed to 'do' since our permissions are specific strings like 'dashboard:view'
export type Actions = "do";
export type Subjects = Permission | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(role: string, customPermissions: string[] = []): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === "SUPER_ADMIN" || role === "ORGANIZATION_OWNER") {
    can("do", "all");
  } else {
    const permissions = permissionsForRole(role, customPermissions);
    permissions.forEach((permission) => {
      can("do", permission as Permission);
    });
  }

  return build();
}
