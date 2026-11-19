import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  next: z.string().optional(),
});

export const Route = createFileRoute("/register")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create Candidate Account — Shivyam Management Services" },
      {
        name: "description",
        content:
          "Register as a candidate with Shivyam Management Services to apply for jobs and connect with leading employers.",
      },
    ],
  }),
  component: RegisterPage,
});

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().trim().email("Please enter a valid email address").max(255),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d\s-]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

function RegisterPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check your inputs");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            full_name: result.data.full_name,
            phone: result.data.phone,
            account_type: "candidate",
          },
        },
      });

      if (error) {
        toast.error(error.message || "Could not complete registration");
        setBusy(false);
        return;
      }

      if (data.user) {
        // Also ensure profile row is created/updated directly
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: result.data.full_name,
            email: result.data.email,
            phone: result.data.phone,
          });
        } catch {
          // Trigger may have already handled this
        }

        // Check if session was granted immediately (auto-confirm enabled)
        if (data.session) {
          toast.success("Account created successfully!");
          const target = search.next && search.next.startsWith("/") ? search.next : "/dashboard";
          navigate({ to: target as unknown as "/" });
        } else {
          // Email confirmation is required by Supabase auth configuration
          setNeedsConfirmation(true);
          toast.info("Please verify your email address to complete registration.");
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      toast.error(e?.message || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-muted/40 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-gold">
              <span className="text-2xl">✉</span>
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-primary">Verify Your Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We have sent a confirmation link to{" "}
              <strong className="text-foreground">{form.email}</strong>. Please click the link in
              your email to activate your account.
            </p>
            <div className="mt-6">
              <Button variant="navy" asChild className="w-full">
                <Link to="/login" search={search.next ? { next: search.next } : {}}>
                  Proceed to Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/40 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-primary">
          Join the Shivyam Talent Network
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your candidate profile to apply for premium opportunities across India.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-card sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <div className="mt-1">
                <Input
                  id="full_name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="mt-1">
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="mt-1">
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-semibold"
                disabled={busy}
              >
                {busy ? "Creating Account…" : "Create Candidate Account"}
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={search.next ? { next: search.next } : {}}
              className="font-semibold text-primary hover:text-gold hover:underline"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
