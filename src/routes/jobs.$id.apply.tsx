import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, daysAgo } from "@/lib/auth";

export const Route = createFileRoute("/jobs/$id/apply")({
  head: () => ({
    meta: [
      { title: "Apply — Shivyam Management Services" },
      {
        name: "description",
        content: "Submit your application and resume through Shivyam Management Services.",
      },
      { property: "og:title", content: "Apply for a Job — Shivyam" },
      { property: "og:description", content: "Submit your application through Shivyam." },
    ],
  }),
  component: Apply,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone number"),
  cover_letter: z.string().max(3000).optional(),
});

function Apply() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cover_letter: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: job } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => (await supabase.from("jobs").select("*").eq("id", id).maybeSingle()).data,
  });

  // Check for prior application to prevent duplicates
  const { data: existingApp, isLoading: checkingExisting } = useQuery({
    queryKey: ["existing-application", id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status, created_at")
        .eq("job_id", id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm((f) => ({
            ...f,
            full_name: data.full_name || f.full_name,
            email: data.email ?? user.email ?? "",
            phone: data.phone ?? "",
          }));
        } else if (user.email) {
          setForm((f) => ({ ...f, email: user.email ?? "" }));
        }
      });
  }, [user]);

  if (loading || checkingExisting) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">Loading…</p>
    );
  }

  // Not logged in -> Prompt to sign in or create an account
  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-primary">Sign In to Apply</h1>
        <p className="mt-3 text-muted-foreground">
          You need a candidate account to apply for <strong>{job?.title ?? "this position"}</strong>
          .
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="navy" asChild>
            <Link to="/login" search={{ next: `/jobs/${id}/apply` }}>
              Sign In
            </Link>
          </Button>
          <Button variant="gold" asChild>
            <Link to="/register" search={{ next: `/jobs/${id}/apply` }}>
              Create Candidate Account
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // Duplicate Check: Candidate has already applied
  if (existingApp) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-primary">
          Application Already Submitted
        </h1>
        <p className="mt-3 text-muted-foreground">
          You have already applied for the position of <strong>{job?.title}</strong> at{" "}
          <strong>{job?.company}</strong>.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 capitalize">
            {existingApp.status}
          </Badge>
          <span className="text-xs text-muted-foreground">({daysAgo(existingApp.created_at)})</span>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="navy" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/jobs">Browse More Jobs</Link>
          </Button>
        </div>
      </main>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success)
      return toast.error(parsed.error.issues[0]?.message ?? "Please check form values");
    if (file && (file.size > 5 * 1024 * 1024 || !/\.(pdf|docx?)$/i.test(file.name))) {
      return toast.error("Resume must be a PDF or Word file under 5 MB");
    }

    setBusy(true);
    let resume_path: string | null = null;
    if (file) {
      resume_path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(resume_path, file);
      if (uploadError) {
        setBusy(false);
        return toast.error("Resume upload failed. Please try again.");
      }
    } else {
      const { data: prof } = await supabase
        .from("profiles")
        .select("resume_path")
        .eq("id", user.id)
        .maybeSingle();
      resume_path = prof?.resume_path ?? null;
    }

    const { error } = await supabase.from("applications").insert({
      job_id: id,
      user_id: user.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      cover_letter: parsed.data.cover_letter || null,
      resume_path,
    });

    setBusy(false);
    if (error) {
      if (error.code === "23505") {
        return toast.error("You have already applied for this job.");
      }
      return toast.error(error.message || "Could not submit application");
    }

    toast.success("Application submitted successfully!");
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/jobs/$id"
        params={{ id }}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to job details
      </Link>
      <h1 className="mt-4 font-serif text-4xl font-bold text-primary">Apply for {job?.title}</h1>
      <p className="mt-1 text-lg font-medium text-gold">{job?.company}</p>

      <form
        onSubmit={submit}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div>
          <Label htmlFor="app_name">Full Name</Label>
          <Input
            id="app_name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="app_email">Email Address</Label>
          <Input
            id="app_email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="app_phone">Phone Number</Label>
          <Input
            id="app_phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="app_resume">Resume (PDF or Word, max 5 MB)</Label>
          <Input
            id="app_resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Upload your latest resume. If left empty, any resume saved to your profile will be used.
          </p>
        </div>

        <div>
          <Label htmlFor="app_cover">Cover Letter / Note to Recruiter (optional)</Label>
          <Textarea
            id="app_cover"
            rows={5}
            placeholder="Introduce yourself and briefly highlight why you are a great fit for this position..."
            value={form.cover_letter}
            onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full font-semibold"
          disabled={busy}
        >
          {busy ? "Submitting Application…" : "Submit Application"}
        </Button>
      </form>
    </main>
  );
}
