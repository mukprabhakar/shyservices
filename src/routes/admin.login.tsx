import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Shivyam Management Services" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Please enter a valid administrator email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setBusy(true);
    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (authError || !data.user) {
        setBusy(false);
        setErrorMsg(authError?.message || "Invalid administrator credentials");
        return;
      }

      // 2. Strict Role Verification: Check if user has 'admin' in user_roles
      const { data: roleRecords, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const hasAdminRole = (roleRecords ?? []).some((r) => r.role === "admin");

      if (roleError || !hasAdminRole) {
        // Immediately revoke session and log out
        await supabase.auth.signOut();
        setBusy(false);
        setErrorMsg("Access Denied: This account is not registered as an administrator.");
        toast.error("Unauthorized: Administrator permissions required.");
        return;
      }

      toast.success("Administrator session verified");
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e?.message || "Authentication error occurred");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white font-mono uppercase">
          Shivyam Administrative Console
        </h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Restricted access. Authorized Shivyam personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
          {errorMsg && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-950/50 p-3.5 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="admin_email" className="text-xs text-slate-300">
                Administrator Email
              </Label>
              <div className="mt-1">
                <Input
                  id="admin_email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@shivyamservices.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin_password" className="text-xs text-slate-300">
                Security Password
              </Label>
              <div className="mt-1">
                <Input
                  id="admin_password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
              >
                {busy ? "Verifying Credentials…" : "Authenticate & Access Console"}
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
