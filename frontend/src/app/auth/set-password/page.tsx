"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SetPermanentPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please retype carefully.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Permanent password set successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to set permanent password.");
        setIsLoading(false);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Set Permanent Password
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Welcome! Because this is your first login with a temporary password, please create a new permanent password for your CommandDesk workspace account.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-permanent-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Permanent Password
            </label>
            <div className="relative">
              <input
                id="new-permanent-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 pl-10 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-permanent-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm Permanent Password
            </label>
            <div className="relative">
              <input
                id="confirm-permanent-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 pl-10 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-sm text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Set Password & Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
