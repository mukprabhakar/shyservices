import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, daysAgo } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Candidate Dashboard — Shivyam Management Services" },
      {
        name: "description",
        content:
          "Track your job applications, profile status, and opportunities with Shivyam Management Services.",
      },
    ],
  }),
  component: DashboardPage,
});

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending Review</Badge>;
    case "reviewed":
    case "under_review":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Under Review</Badge>;
    case "shortlisted":
    case "interview":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Shortlisted</Badge>
      );
    case "rejected":
      return <Badge className="bg-rose-100 text-rose-800 border-rose-300">Not Selected</Badge>;
    case "hired":
    case "offered":
      return <Badge className="bg-green-600 text-white border-green-700">Offer Received</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { next: "/dashboard" } });
    }
  }, [user, authLoading, navigate]);

  // Fetch Candidate Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["candidate-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch Candidate Applications with Job details
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["candidate-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          job_id,
          user_id,
          full_name,
          email,
          phone,
          cover_letter,
          resume_path,
          status,
          created_at,
          jobs (
            id,
            title,
            company,
            location,
            job_type,
            work_mode,
            salary_min,
            salary_max
          )
        `,
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    headline: "",
    location: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        headline: profile.headline || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updated: typeof profileForm) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updated.full_name,
          phone: updated.phone,
          headline: updated.headline,
          location: updated.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["candidate-profile", user?.id] });
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error(e.message || "Failed to update profile");
    },
  });

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading candidate portal…</p>
      </div>
    );
  }

  const totalApps = applications.length;
  const pendingCount = applications.filter((a) => a.status.toLowerCase() === "pending").length;
  const shortlistedCount = applications.filter((a) =>
    ["shortlisted", "interview", "hired", "offered"].includes(a.status.toLowerCase()),
  ).length;
  const rejectedCount = applications.filter((a) => a.status.toLowerCase() === "rejected").length;

  return (
    <main className="min-h-screen bg-muted/20 pb-16">
      {/* Top Banner */}
      <section className="bg-hero-dots text-hero-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hero-foreground/20 bg-hero/50 px-3 py-1 text-xs font-semibold text-gold">
                Candidate Portal
              </span>
              <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
                Welcome, {profile?.full_name || user.email?.split("@")[0] || "Candidate"}
              </h1>
              <p className="mt-1 text-sm text-hero-muted">
                Track your active job applications and keep your career profile up to date.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" asChild>
                <Link to="/jobs">
                  <Search className="mr-2 h-4 w-4" /> Browse Jobs
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-hero-foreground/15 bg-card/10 p-4 backdrop-blur">
              <p className="text-xs text-hero-muted">Total Applied</p>
              <p className="font-serif text-2xl font-bold text-hero-foreground mt-1">{totalApps}</p>
            </div>
            <div className="rounded-2xl border border-hero-foreground/15 bg-card/10 p-4 backdrop-blur">
              <p className="text-xs text-hero-muted">Pending Review</p>
              <p className="font-serif text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-hero-foreground/15 bg-card/10 p-4 backdrop-blur">
              <p className="text-xs text-hero-muted">Shortlisted</p>
              <p className="font-serif text-2xl font-bold text-emerald-400 mt-1">
                {shortlistedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-hero-foreground/15 bg-card/10 p-4 backdrop-blur">
              <p className="text-xs text-hero-muted">Not Selected</p>
              <p className="font-serif text-2xl font-bold text-rose-300 mt-1">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger
              value="applications"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Briefcase className="mr-2 h-4 w-4" /> My Applications ({totalApps})
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="mr-2 h-4 w-4" /> My Profile
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Applications */}
          <TabsContent value="applications" className="space-y-4">
            {appsLoading && (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                Loading your applications…
              </div>
            )}

            {!appsLoading && applications.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-card">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-gold">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-primary">
                  No Applications Yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  You haven't applied to any job openings yet. Explore verified opportunities
                  curated by Shivyam Management Services.
                </p>
                <div className="mt-6">
                  <Button variant="gold" asChild>
                    <Link to="/jobs">Explore Open Roles</Link>
                  </Button>
                </div>
              </div>
            )}

            {!appsLoading && applications.length > 0 && (
              <div className="space-y-4">
                {applications.map((app) => {
                  const job = app.jobs as {
                    title?: string;
                    company?: string;
                    location?: string;
                  } | null;
                  return (
                    <article
                      key={app.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-xl font-bold text-primary">
                            {job?.title || "Job Position"}
                          </h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-sm font-medium text-gold flex items-center gap-1.5">
                          <Building className="h-4 w-4" />
                          {job?.company || "Hiring Partner"}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                          {job?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.location}
                            </span>
                          )}
                          {job?.job_type && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {job.job_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Applied {daysAgo(app.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                        {job?.id && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/jobs/$id" params={{ id: job.id }}>
                              View Job <ExternalLink className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="navy" size="sm">
                              Application Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-serif text-xl text-primary">
                                Application Summary
                              </DialogTitle>
                              <DialogDescription>
                                Submitted for <strong>{job?.title}</strong> at{" "}
                                <strong>{job?.company}</strong>
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 pt-4 text-sm">
                              <div>
                                <span className="font-semibold text-foreground">Status:</span>{" "}
                                {getStatusBadge(app.status)}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Applicant Name:
                                </span>{" "}
                                <span className="text-muted-foreground">{app.full_name}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Contact Email:
                                </span>{" "}
                                <span className="text-muted-foreground">{app.email}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Contact Phone:
                                </span>{" "}
                                <span className="text-muted-foreground">{app.phone}</span>
                              </div>
                              {app.cover_letter && (
                                <div>
                                  <span className="font-semibold text-foreground block mb-1">
                                    Cover Letter:
                                  </span>
                                  <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                                    {app.cover_letter}
                                  </p>
                                </div>
                              )}
                              {app.resume_path && (
                                <div>
                                  <span className="font-semibold text-foreground block mb-1">
                                    Uploaded Resume:
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium bg-gold-soft px-3 py-1.5 rounded-lg">
                                    <FileText className="h-3.5 w-3.5 text-gold" />
                                    {app.resume_path.split("/").pop()}
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground pt-2">
                                Submitted on: {new Date(app.created_at).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Profile Management */}
          <TabsContent value="profile">
            <Card className="rounded-2xl border-border shadow-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-primary">
                  Candidate Profile
                </CardTitle>
                <CardDescription>
                  Keep your personal and contact details updated for Shivyam hiring partners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMutation.mutate(profileForm);
                  }}
                  className="space-y-5 max-w-xl"
                >
                  <div>
                    <Label htmlFor="prof_email">Registered Email</Label>
                    <Input
                      id="prof_email"
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="bg-muted text-muted-foreground mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email address is managed via your account authentication.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="prof_name">Full Name</Label>
                    <Input
                      id="prof_name"
                      required
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, full_name: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prof_phone">Phone Number</Label>
                    <Input
                      id="prof_phone"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prof_headline">Professional Headline / Specialization</Label>
                    <Input
                      id="prof_headline"
                      placeholder="e.g. Senior Operations Executive | 5+ Years in Plant Logistics"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prof_location">Current Location</Label>
                    <Input
                      id="prof_location"
                      placeholder="e.g. Gurugram, Haryana / Delhi NCR"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving Changes…" : "Save Profile Details"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
