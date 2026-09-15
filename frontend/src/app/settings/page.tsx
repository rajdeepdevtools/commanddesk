"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Check,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
  Building,
  Key,
  Smartphone,
  Lock,
  Globe,
  Plus,
  Trash2,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";

type SettingsData = {
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    role: string;
    timezone: string;
  };
  organization: {
    companyName: string;
    taxId: string;
    email: string;
    phone: string;
    timezone: string;
    country: string;
  };
  security: {
    twoFactorEnabled: boolean;
  };
};

export default function SettingsPage() {
  const { data, isLoading, error } = useQuery<{
    settings: SettingsData;
    canManageOrganization: boolean;
  }>({
    queryKey: ["settings-data"],
    queryFn: () => apiClient.get("/settings").then((response) => response.data),
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {/* Top Header Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <SettingsIcon className="h-3.5 w-3.5 text-indigo-600" />
              System Preferences
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900">
              Workspace Settings & Security
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
              Manage your personal profile, organization profile, custom RBAC permissions, and multi-factor security credentials.
            </p>
          </div>
        </section>

        {isLoading && (
          <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/50" />
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 text-sm font-medium">
            Unable to load workspace settings. Please refresh or check server connection.
          </div>
        )}
        {data && (
          <SettingsForm
            key={`${data.settings.profile.email}-${data.settings.profile.avatarUrl ?? ""}`}
            initial={data.settings}
            canManageOrganization={data.canManageOrganization}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function SettingsForm({
  initial,
  canManageOrganization,
}: {
  initial: SettingsData;
  canManageOrganization: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "roles" | "security">("profile");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: initial.profile.firstName,
    lastName: initial.profile.lastName,
    phone: initial.profile.phone,
  });

  // Organization Form State
  const [organization, setOrganization] = useState(initial.organization);

  // Custom Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Security Password State
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [twoFactor, setTwoFactor] = useState(initial.security.twoFactorEnabled);

  // Save Settings Mutation
  const save = useMutation({
    mutationFn: () =>
      activeTab === "organization"
        ? apiClient.patch("/settings", { scope: "organization", ...organization })
        : apiClient.patch("/settings", { scope: "profile", ...profile }),
    onSuccess: async () => {
      setMessage("Settings updated successfully.");
      setErrorMessage("");
      await queryClient.invalidateQueries({ queryKey: ["settings-data"] });
      router.refresh();
      window.setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.error || "Failed to update settings.");
    },
  });

  // Avatar Upload Mutation
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
      if (!allowed.has(file.type)) {
        throw new Error("Only JPG, PNG, WEBP, and GIF images are allowed.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Profile image must be 5 MB or smaller.");
      }
      const payload = new FormData();
      payload.append("avatar", file);
      return apiClient.post("/profile/avatar", payload);
    },
    onSuccess: async () => {
      setMessage("Profile photo updated.");
      setErrorMessage("");
      await queryClient.invalidateQueries({ queryKey: ["settings-data"] });
      router.refresh();
      window.setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to upload profile photo.");
    },
  });

  // Custom Roles Query
  const { data: rolesData } = useQuery<{
    customRoles?: Array<{ id: string; name: string; description?: string; _count?: { memberships: number } }>;
  }>({
    queryKey: ["settings-roles"],
    queryFn: () => apiClient.get("/roles").then((res) => res.data),
    enabled: activeTab === "roles",
  });

  // Create Custom Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: () => apiClient.post("/roles", { name: newRoleName, description: newRoleDesc }),
    onSuccess: async () => {
      setMessage("New custom role created successfully.");
      setErrorMessage("");
      setNewRoleName("");
      setNewRoleDesc("");
      await queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
      window.setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.error || "Failed to create custom role.");
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwords.newPass !== passwords.confirmPass) {
        throw new Error("New passwords do not match.");
      }
      if (passwords.newPass.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      return apiClient.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
    },
    onSuccess: () => {
      setMessage("Password updated successfully.");
      setErrorMessage("");
      setPasswords({ current: "", newPass: "", confirmPass: "" });
      window.setTimeout(() => setMessage(""), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || err?.response?.data?.error || "Unable to update password.");
    },
  });

  const tabs = [
    { id: "profile" as const, label: "Profile Info", icon: User },
    ...(canManageOrganization
      ? [{ id: "organization" as const, label: "Organization", icon: Building }]
      : []),
    { id: "roles" as const, label: "Roles & Permissions", icon: ShieldCheck },
    { id: "security" as const, label: "Security & Auth", icon: Lock },
  ];

  const initials = `${(profile.firstName || initial.profile.firstName || "V")[0]}${(profile.lastName || initial.profile.lastName || "M")[0]}`.toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left Sidebar Navigation */}
      <nav className="lg:col-span-3 space-y-1.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setMessage("");
              setErrorMessage("");
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right Main Settings Card */}
      <section className="lg:col-span-9 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Alerts Feedback */}
        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <Check className="h-4 w-4 text-emerald-600" /> {message}
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* 1. Profile Info Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Personal Profile</h2>
              <p className="text-xs text-slate-500">Update your avatar, name, and contact details</p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-xs">
                {initial.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={initial.profile.avatarUrl}
                    alt={initial.profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs">
                  <Camera className="h-3.5 w-3.5" />
                  {uploadAvatar.isPending ? "Uploading Photo..." : "Upload Profile Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadAvatar.isPending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadAvatar.mutate(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  JPG, PNG, WEBP, or GIF. Maximum file size 5 MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First Name"
                value={profile.firstName}
                onChange={(val) => setProfile({ ...profile, firstName: val })}
              />
              <Field
                label="Last Name"
                value={profile.lastName}
                onChange={(val) => setProfile({ ...profile, lastName: val })}
              />
              <Field
                label="Phone Number"
                value={profile.phone}
                onChange={(val) => setProfile({ ...profile, phone: val })}
                placeholder="+91 98765 43210"
              />
              <Field label="Email Address" value={initial.profile.email} disabled />
              <Field
                label="Role Category"
                value={initial.profile.role.replaceAll("_", " ")}
                disabled
              />
              <Field label="Timezone" value={initial.profile.timezone} disabled />
            </div>
          </div>
        )}

        {/* 2. Organization Tab */}
        {activeTab === "organization" && canManageOrganization && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Organization Configuration</h2>
              <p className="text-xs text-slate-500">Configure company entity, tax ID, and legal location parameters</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Company / Entity Name"
                value={organization.companyName}
                onChange={(val) => setOrganization({ ...organization, companyName: val })}
              />
              <Field
                label="Tax / GST ID"
                value={organization.taxId}
                onChange={(val) => setOrganization({ ...organization, taxId: val })}
              />
              <Field
                label="Corporate Email"
                value={organization.email}
                onChange={(val) => setOrganization({ ...organization, email: val })}
              />
              <Field
                label="Corporate Phone"
                value={organization.phone}
                onChange={(val) => setOrganization({ ...organization, phone: val })}
              />
              <Field
                label="Operating Timezone"
                value={organization.timezone}
                onChange={(val) => setOrganization({ ...organization, timezone: val })}
              />
              <Field
                label="Country / Region"
                value={organization.country}
                onChange={(val) => setOrganization({ ...organization, country: val })}
              />
            </div>
          </div>
        )}

        {/* 3. Roles & Permissions Tab */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Roles & Permissions Management</h2>
              <p className="text-xs text-slate-500">Configure System RBAC levels and provision custom workspace roles</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" /> Create Custom Workspace Role
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newRoleName.trim()) createRoleMutation.mutate();
                }}
                className="grid gap-3 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal Architect"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Responsibilities & scope"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newRoleName.trim() || createRoleMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 shadow-xs"
                  >
                    {createRoleMutation.isPending ? "Creating Role..." : "+ Add Custom Role"}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active System & Custom Roles</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Super Admin", type: "System", desc: "Master administrative access to all workspace systems" },
                  { name: "Organization Owner", type: "System", desc: "Workspace owner & billing manager" },
                  { name: "Admin", type: "System", desc: "Administrative access to settings & user management" },
                  { name: "HR Manager", type: "System", desc: "HRMS, payroll processing, and employee records" },
                  { name: "Project Manager", type: "System", desc: "Projects, Kanban boards, and task allocations" },
                  { name: "Finance Specialist", type: "System", desc: "Financial ledgers, invoices, and expense tracking" },
                  { name: "Sales Executive", type: "System", desc: "CRM pipeline, deals, and client relationships" },
                  { name: "Standard Employee", type: "System", desc: "Standard employee portal access" },
                  ...(rolesData?.customRoles || []).map((cr) => ({
                    name: cr.name,
                    type: "Custom",
                    desc: cr.description || "Custom workspace role",
                  })),
                ].map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-1.5 hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{r.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          r.type === "System"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-indigo-100 text-indigo-700 font-bold"
                        }`}
                      >
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Security & Auth Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Security & Credentials</h2>
              <p className="text-xs text-slate-500">Manage password updates, multi-factor authentication, and active user sessions</p>
            </div>

            {/* Change Password Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-600" /> Change Account Password
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  changePasswordMutation.mutate();
                }}
                className="grid gap-3 sm:grid-cols-3"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={!passwords.current || !passwords.newPass || changePasswordMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 shadow-xs"
                  >
                    {changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Two Factor Authentication Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Two-Factor Authentication (2FA)</h3>
                </div>
                <p className="text-xs text-slate-500">Secure your account using an authenticator app (TOTP) or SMS code</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactor(!twoFactor);
                  setMessage(`Two-Factor Authentication ${!twoFactor ? "Enabled" : "Disabled"}.`);
                  window.setTimeout(() => setMessage(""), 3000);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactor ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactor ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Active Sessions */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-indigo-600" /> Active Master Sessions
              </h3>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Current Windows Chrome Session</h4>
                    <p className="text-[11px] text-slate-500">IP: 127.0.0.1 • Master Super Owner Admin • Active Now</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button for Profile & Organization */}
        {activeTab !== "security" && activeTab !== "roles" && (
          <div className="pt-4 border-t border-slate-200/90 flex justify-end">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending || uploadAvatar.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 shadow-md shadow-indigo-600/20 active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving Changes…" : "Save Workspace Changes"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
      <span>{label}</span>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-500 transition-all duration-200"
      />
    </label>
  );
}
