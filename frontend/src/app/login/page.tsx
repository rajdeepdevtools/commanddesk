"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SolubrixLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { getAppOrigin } from "@/utils/origin";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Refs for GSAP animation targets
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftHeroRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // GSAP Animations setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ambient Floating Glowing Orbs (Infinite Sine Wave Physics)
      gsap.to(orb1Ref.current, {
        y: "+=35",
        x: "-=25",
        scale: 1.1,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(orb2Ref.current, {
        y: "-=40",
        x: "+=30",
        scale: 1.15,
        duration: 8.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(orb3Ref.current, {
        y: "+=25",
        x: "+=20",
        scale: 0.9,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Timeline Entrance Sequence
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        leftHeroRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1 }
      )
        .fromTo(
          ".hero-badge",
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.6"
        )
        .fromTo(
          ".hero-feature-item",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
          "-=0.4"
        )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9 },
          "-=0.8"
        )
        .fromTo(
          ".form-anim-item",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          "-=0.5"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3. Realistic 3D Glass Parallax Mouse Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Subtle 3D rotation calculation
    const rotateX = (-mouseY / (rect.height / 2)) * 6; // Max 6 deg
    const rotateY = (mouseX / (rect.width / 2)) * 6;

    gsap.to(cardRef.current, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  };

  const handleDemoAdminLogin = async (customEmail?: string, customPassword?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const loginEmail = customEmail || email || "rajdeepdevtools@gmail.com";
      const loginPassword = customPassword || password || "";
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (data.mustChangePassword) {
          window.location.href = "/auth/set-password";
          return;
        }
        const nextParam =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
        const destination =
          nextParam &&
          nextParam.startsWith("/") &&
          !nextParam.startsWith("//") &&
          !nextParam.includes("manifest.json")
            ? nextParam
            : "/";
        window.location.href = destination;
      } else {
        setError(data.error || "Unable to authenticate account session.");
        setIsLoading(false);
      }
    } catch {
      setError("Unable to connect to authentication server.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResetSuccessMsg("");

    const isPlaceholderSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project-ref");
    if (isPlaceholderSupabase) {
      await handleDemoAdminLogin(email, password);
      return;
    }

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (signInError) throw signInError;
      const nextParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const destination =
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") &&
        !nextParam.includes("manifest.json")
          ? nextParam
          : "/";
      window.location.href = destination;
    } catch (caught) {
      // Fallback to local DB password verification if Supabase Auth is isolated
      await handleDemoAdminLogin(email, password);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    setResetSuccessMsg("");

    const isPlaceholderSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project-ref");
    if (isPlaceholderSupabase) {
      await handleDemoAdminLogin();
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getAppOrigin()}/auth/callback`,
        },
      });
      if (oauthError) {
        await handleDemoAdminLogin();
      }
    } catch {
      await handleDemoAdminLogin();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Enter your email address first to receive a password reset link.");
      return;
    }
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${getAppOrigin()}/auth/callback?next=/auth/reset-password`,
      }
    );
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSuccessMsg("Password reset link sent! Check your inbox.");
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-indigo-500/20 selection:text-indigo-900"
    >
      {/* Harmonized Light Ambient Mesh Orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-indigo-200/50 via-sky-100/40 to-transparent blur-3xl opacity-80"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-tl from-teal-200/40 via-indigo-100/40 to-transparent blur-3xl opacity-70"
      />
      <div
        ref={orb3Ref}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full bg-gradient-to-r from-purple-200/40 via-slate-100/40 to-indigo-200/40 blur-3xl opacity-60"
      />

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      {/* Main Grid Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Feature Showcase (Desktop Only) */}
        <div
          ref={leftHeroRef}
          className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-6"
        >
          {/* Top Logo & Enterprise Badge */}
          <div className="space-y-4">
            <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 backdrop-blur-md text-indigo-700 text-xs font-semibold tracking-wide shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              Enterprise Business OS 3.0
            </div>
            <SolubrixLogo variant="default" size="xl" showTagline />
          </div>

          {/* Hero Pitch Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-heading font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Accelerate Enterprise Operations with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
                CommandDesk
              </span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed font-medium">
              Unify ERP analytics, HR management, project intelligence, and financial workflows in one ultra-responsive, secure portal.
            </p>
          </div>

          {/* Feature Highlights Glass Cards */}
          <div className="space-y-3 pt-2">
            <div className="hero-feature-item flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 border border-slate-200/90 backdrop-blur-md hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Multi-Entity ERP & CRM</h4>
                <p className="text-xs text-slate-500">Real-time revenue metrics, client pipelines, and automated invoicing.</p>
              </div>
            </div>

            <div className="hero-feature-item flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 border border-slate-200/90 backdrop-blur-md hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Smart HRMS & Payroll</h4>
                <p className="text-xs text-slate-500">Attendance tracking, leave approval chains, and automated payslips.</p>
              </div>
            </div>

            <div className="hero-feature-item flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 border border-slate-200/90 backdrop-blur-md hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Bank-Grade Security</h4>
                <p className="text-xs text-slate-500">SOC2 Type II compliance, granular RBAC, and end-to-end audit logging.</p>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium pt-4 border-t border-slate-200">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SOC2 Certified
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Lock className="w-4 h-4 text-indigo-600" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* Right Side: Ultra-Glassy Light Mode Login Form Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            ref={cardRef}
            className="relative w-full max-w-md rounded-3xl bg-white/85 backdrop-blur-2xl border border-slate-200/90 p-7 sm:p-9 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08)] overflow-hidden"
          >
            {/* Top Glossy Highlight Reflection Bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
            <div className="pointer-events-none absolute -top-20 -right-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl" />

            {/* Mobile Logo Showcase */}
            <div className="form-anim-item lg:hidden flex justify-center mb-6">
              <SolubrixLogo variant="default" size="lg" />
            </div>

            {/* Title & Description */}
            <div className="form-anim-item space-y-1.5 mb-7">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight flex items-center justify-between">
                <span>Sign In</span>
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Access your CommandDesk enterprise workspace
              </p>
            </div>

            {/* Login Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Alert Feedback Messages */}
              {error && (
                <div className="form-anim-item p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed animate-in fade-in">
                  {error}
                </div>
              )}
              {resetSuccessMsg && (
                <div className="form-anim-item p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium leading-relaxed animate-in fade-in">
                  {resetSuccessMsg}
                </div>
              )}

              {/* Email Input Field */}
              <div className="form-anim-item space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input Field with Reveal Toggle */}
              <div className="form-anim-item space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="form-anim-item flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="form-anim-item pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In to Workspace <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="form-anim-item relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-slate-100 px-3 text-slate-500 rounded-full border border-slate-200">
                  Or authenticate with
                </span>
              </div>
            </div>

            {/* Google OAuth Button & Master Admin Quick Login */}
            <div className="form-anim-item space-y-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={() => handleDemoAdminLogin()}
                disabled={isLoading}
                className="w-full h-10 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Quick Sign In (Master Super Owner Admin)
              </Button>
            </div>

            {/* Bottom Employee Activation Footer */}
            <div className="form-anim-item mt-7 pt-4 border-t border-slate-200 text-center text-xs text-slate-600 space-y-1.5">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-800">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> New Team Member?
              </p>
              <p className="text-slate-500">
                Received an invite token?{" "}
                <Link
                  href="/auth/activate"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-500 transition-colors"
                >
                  Activate account & password
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
