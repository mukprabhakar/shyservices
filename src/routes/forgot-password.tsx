import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Shivyam Management Services" },
      { name: "description", content: "Recover your Shivyam portal account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please enter a valid email");
      return;
    }

    setBusy(true);
    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error(error.message || "Could not process request");
      } else {
        setSubmitted(true);
        toast.success("Password reset instructions sent");
      }
    } catch (err: unknown) {
      const e = err as Error;
      toast.error(e?.message || "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/40 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-primary">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-card sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold">
                ✓
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong> if it is
                registered in our system.
              </p>
              <Button variant="navy" asChild className="w-full mt-4">
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="mt-1.5">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-semibold"
                disabled={busy}
              >
                {busy ? "Sending Link…" : "Send Reset Link"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary hover:text-gold hover:underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
