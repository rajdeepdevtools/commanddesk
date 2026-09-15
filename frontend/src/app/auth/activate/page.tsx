"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, CheckCircle2, Loader as Loader2, Mail, Key } from "lucide-react";
import Link from "next/link";
import { SolubrixIcon } from "@/components/brand/logo";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qToken = searchParams.get("token");
    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), token: token.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Account activation failed.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setError(err?.message || "Failed to set password and activate account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand Logo */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-indigo to-premium-teal shadow-lg shadow-indigo-500/20">
            <SolubrixIcon className="h-7 w-7 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            Solubrix
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-medium">Employee Account Activation</p>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white">Account Activated!</h2>
            <p className="text-sm text-slate-300">
              Your password has been set successfully. You can now log into CommandDesk with your email and new password.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-indigo text-white font-semibold text-sm hover:bg-primary-indigo/90 transition shadow-lg shadow-indigo-500/25"
              >
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold font-heading text-white flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Activate Your Account
              </h2>
              <p className="text-xs text-slate-400">
                Set up your password to activate your employee profile.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                <label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>

              {/* Optional Token */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                <label htmlFor="token" className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" /> Activation Code / Token (Optional)
                </label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter activation token if provided"
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                <label htmlFor="new-password">Create Password</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-300">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-indigo to-indigo-600 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Activating Account...
                </>
              ) : (
                <>
                  Set Password & Activate <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                Already active? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-100">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/20 blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-center text-white"><Loader2 className="animate-spin h-8 w-8 mx-auto" />Loading...</div>}>
        <ActivateContent />
      </Suspense>
    </main>
  );
}
