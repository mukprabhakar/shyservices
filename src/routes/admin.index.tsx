import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth, daysAgo } from "@/lib/auth";

type JobRow = Tables<"jobs">;
type ApplicationRow = Tables<"applications"> & { jobs?: JobRow | null };

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Console — Shivyam Management Services" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

const jobSchema = z.object({
  title: z.string().trim().min(2, "Job title is required").max(150),
  company: z.string().trim().min(2, "Company name is required").max(150),
  location: z.string().trim().min(2, "Location is required").max(100),
  job_type: z.string().default("Full-time"),
  work_mode: z.string().default("On-site"),
  experience_level: z.string().default("Entry Level"),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  description: z.string().trim().min(10, "Job description must be at least 10 characters"),
  requirements: z.string().trim().default(""),
  is_active: z.boolean().default(true),
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications" | "candidates">(
    "overview",
  );

  // Search & Filters
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [appSearch, setAppSearch] = useState("");
  const [appJobFilter, setAppJobFilter] = useState<string>("all");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [candSearch, setCandSearch] = useState("");

  // Job Modal (Create / Edit)
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "Shivyam Partner Client",
    location: "IMT Manesar, Haryana",
    job_type: "Full-time",
    work_mode: "On-site",
    experience_level: "Entry Level",
    salary_min: "" as string | number,
    salary_max: "" as string | number,
    description: "",
    requirements: "",
    is_active: true,
  });

  // Delete Job Dialog
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Application Details Modal
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);

  // 1. Fetch All Jobs (Admin RLS allows fetching active + inactive)
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["admin-jobs"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // 2. Fetch All Applications (Admin RLS allows fetching all submissions)
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["admin-applications"],
    enabled: !!user && isAdmin,
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
            location
          )
        `,
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // 3. Fetch Registered Candidate Profiles
  const { data: candidates = [], isLoading: candsLoading } = useQuery({
    queryKey: ["admin-candidates"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Generate signed URL when an application with resume is viewed
  useEffect(() => {
    if (selectedApp?.resume_path) {
      supabase.storage
        .from("resumes")
        .createSignedUrl(selectedApp.resume_path, 3600)
        .then(({ data }) => {
          setResumeSignedUrl(data?.signedUrl ?? null);
        });
    } else {
      setResumeSignedUrl(null);
    }
  }, [selectedApp]);

  // Handle Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Admin session terminated");
    navigate({ to: "/admin/login" });
  };

  // Job Mutations: Create, Update, Toggle, Delete
  const saveJobMutation = useMutation({
    mutationFn: async (payload: typeof jobForm) => {
      const parsed = jobSchema.parse({
        ...payload,
        salary_min: payload.salary_min ? Number(payload.salary_min) : null,
        salary_max: payload.salary_max ? Number(payload.salary_max) : null,
      });

      if (editingJobId) {
        const { error } = await supabase.from("jobs").update(parsed).eq("id", editingJobId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert({
          ...parsed,
          posted_by: user!.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingJobId ? "Job posting updated" : "Job published successfully");
      setJobModalOpen(false);
      setEditingJobId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error(e.message || "Failed to save job posting");
    },
  });

  const toggleJobStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("jobs").update({ is_active: !is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error(e.message || "Could not toggle job status");
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posting removed");
      setDeleteJobId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error(e.message || "Could not delete job");
    },
  });

  // Application Status Mutation
  const updateAppStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Candidate application status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error(e.message || "Could not update application status");
    },
  });

  // Open Create Job Modal
  const openCreateJobModal = () => {
    setEditingJobId(null);
    setJobForm({
      title: "",
      company: "Shivyam Partner Client",
      location: "IMT Manesar, Haryana",
      job_type: "Full-time",
      work_mode: "On-site",
      experience_level: "Entry Level",
      salary_min: "",
      salary_max: "",
      description: "",
      requirements: "",
      is_active: true,
    });
    setJobModalOpen(true);
  };

  // Open Edit Job Modal
  const openEditJobModal = (job: JobRow) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      work_mode: job.work_mode,
      experience_level: job.experience_level,
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
      description: job.description,
      requirements: job.requirements,
      is_active: job.is_active,
    });
    setJobModalOpen(true);
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        !jobSearch ||
        `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(jobSearch.toLowerCase());
      const matchesStatus =
        jobStatusFilter === "all" || (jobStatusFilter === "active" ? j.is_active : !j.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !appSearch ||
        `${app.full_name} ${app.email} ${app.phone}`
          .toLowerCase()
          .includes(appSearch.toLowerCase());
      const matchesJob = appJobFilter === "all" || app.job_id === appJobFilter;
      const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, appSearch, appJobFilter, appStatusFilter]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (!candSearch) return true;
      const q = candSearch.toLowerCase();
      return (
        (c.full_name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.headline || "").toLowerCase().includes(q) ||
        (c.location || "").toLowerCase().includes(q)
      );
    });
  }, [candidates, candSearch]);

  // Auth Loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-400 mr-2" />
        <span>Authenticating administrative credentials…</span>
      </div>
    );
  }

  // Unauthorized: User not signed in
  if (!user) {
    navigate({ to: "/admin/login" });
    return null;
  }

  // Forbidden: Signed in but not an admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md text-center rounded-2xl border border-red-500/20 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold font-mono text-white">403 — Access Denied</h1>
          <p className="mt-2 text-xs text-slate-400">
            Account <strong>{user.email}</strong> does not have administrator privileges.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Sign In with Admin Account
            </Button>
            <Button variant="ghost" asChild className="text-xs text-slate-400 hover:text-white">
              <Link to="/">Return to Candidate Portal</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Metrics
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter((j) => j.is_active).length;
  const totalAppsCount = applications.length;
  const pendingAppsCount = applications.filter((a) => a.status.toLowerCase() === "pending").length;
  const shortlistedAppsCount = applications.filter((a) =>
    ["shortlisted", "interview", "hired"].includes(a.status.toLowerCase()),
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-white">SHIVYAM</span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] uppercase font-mono px-1.5 py-0">
                Admin Console
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">Recruitment & Operations Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-medium text-slate-200">{user.email}</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Role: Verified Administrator
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
          >
            <LogOut className="h-3.5 w-3.5 mr-1 text-slate-400" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main Admin Console Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-medium text-xs"
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-medium text-xs"
              >
                <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Job Postings ({totalJobsCount})
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-medium text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Applications ({totalAppsCount})
              </TabsTrigger>
              <TabsTrigger
                value="candidates"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-medium text-xs"
              >
                <Users className="h-3.5 w-3.5 mr-1.5" /> Talent Records ({candidates.length})
              </TabsTrigger>
            </TabsList>

            {activeTab === "jobs" && (
              <Button
                onClick={openCreateJobModal}
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
              >
                <Plus className="h-4 w-4 mr-1" /> Post New Job
              </Button>
            )}
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase font-mono">
                  Total Positions
                </p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono text-white">{totalJobsCount}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    {activeJobsCount} Active
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase font-mono">
                  Total Applications
                </p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono text-white">{totalAppsCount}</span>
                  <span className="text-xs text-slate-400">Across all jobs</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase font-mono">
                  Pending Review
                </p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono text-amber-400">
                    {pendingAppsCount}
                  </span>
                  <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">
                    Action Needed
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs text-slate-400 font-medium uppercase font-mono">
                  Shortlisted / Hired
                </p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-mono text-emerald-400">
                    {shortlistedAppsCount}
                  </span>
                  <span className="text-xs text-slate-400">Active pipeline</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase font-mono flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-amber-400" /> Active Job Vacancies
                </h3>
                <div className="space-y-3">
                  {jobs.slice(0, 4).map((j) => (
                    <div
                      key={j.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900 p-3.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{j.title}</p>
                        <p className="text-xs text-slate-400">
                          {j.company} • {j.location}
                        </p>
                      </div>
                      <Badge
                        className={
                          j.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }
                      >
                        {j.is_active ? "Active" : "Closed"}
                      </Badge>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No jobs created yet.</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("jobs")}
                  className="w-full border-slate-800 bg-slate-900 text-xs text-slate-300"
                >
                  Manage All Jobs
                </Button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase font-mono flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" /> Recent Applications
                </h3>
                <div className="space-y-3">
                  {applications.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900 p-3.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{a.full_name}</p>
                        <p className="text-xs text-slate-400">
                          Applied for {(a.jobs as JobRow | null)?.title || "Role"} •{" "}
                          {daysAgo(a.created_at)}
                        </p>
                      </div>
                      <Badge className="capitalize text-xs bg-slate-800 text-slate-300 border-slate-700">
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      No applications received yet.
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("applications")}
                  className="w-full border-slate-800 bg-slate-900 text-xs text-slate-300"
                >
                  Review All Applications
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: JOB MANAGEMENT */}
          <TabsContent value="jobs" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by title, client, or city…"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value as typeof jobStatusFilter)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Closed / Draft Only</option>
                </select>
              </div>
            </div>

            {jobsLoading && (
              <div className="text-center py-12 text-slate-500 text-sm">Loading job records…</div>
            )}

            {!jobsLoading && filteredJobs.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                <p className="text-slate-400 text-sm">No job postings found.</p>
                <Button
                  onClick={openCreateJobModal}
                  size="sm"
                  className="mt-4 bg-amber-500 text-slate-950 font-semibold text-xs"
                >
                  Create First Job
                </Button>
              </div>
            )}

            {!jobsLoading && filteredJobs.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Title & Client</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Type / Mode</th>
                        <th className="py-3 px-4">Salary Band</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredJobs.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">{j.title}</span>
                            <span className="text-[11px] text-amber-400/90">{j.company}</span>
                          </td>
                          <td className="py-3 px-4">{j.location}</td>
                          <td className="py-3 px-4">
                            <span className="block">{j.job_type}</span>
                            <span className="text-[11px] text-slate-500">{j.work_mode}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            {j.salary_min || j.salary_max ? (
                              <span>
                                ₹{(j.salary_min ?? 0).toLocaleString("en-IN")} – ₹
                                {(j.salary_max ?? 0).toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-slate-500">Not Specified</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                toggleJobStatusMutation.mutate({ id: j.id, is_active: j.is_active })
                              }
                              title="Click to toggle status"
                              className="focus:outline-none"
                            >
                              <Badge
                                className={
                                  j.is_active
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-pointer"
                                    : "bg-slate-800 text-slate-400 border-slate-700 cursor-pointer"
                                }
                              >
                                {j.is_active ? "Active" : "Closed"}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditJobModal(j)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit Job"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteJobId(j.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                              title="Delete Job"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: APPLICATIONS MANAGEMENT */}
          <TabsContent value="applications" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search applicant name, email, phone…"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none max-w-xs"
                >
                  <option value="all">Filter by Position: All</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>

                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none"
                >
                  <option value="all">Filter by Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Not Selected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            {appsLoading && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Loading application pipeline…
              </div>
            )}

            {!appsLoading && filteredApps.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400 text-sm">
                No candidate applications match your filter criteria.
              </div>
            )}

            {!appsLoading && filteredApps.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Candidate Details</th>
                        <th className="py-3 px-4">Target Job</th>
                        <th className="py-3 px-4">Applied</th>
                        <th className="py-3 px-4">Review Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredApps.map((a) => {
                        const job = a.jobs as JobRow | null;
                        return (
                          <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-white block">{a.full_name}</span>
                              <span className="text-[11px] text-slate-400 block">{a.email}</span>
                              <span className="text-[11px] text-slate-500">{a.phone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-200 block">
                                {job?.title || "Position"}
                              </span>
                              <span className="text-[11px] text-slate-500">{job?.company}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {daysAgo(a.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={a.status}
                                onChange={(e) =>
                                  updateAppStatusMutation.mutate({
                                    id: a.id,
                                    status: e.target.value,
                                  })
                                }
                                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-200 outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Not Selected</option>
                                <option value="hired">Hired</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedApp(a)}
                                className="border-slate-800 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View Dossier
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 4: TALENT RECORDS */}
          <TabsContent value="candidates" className="space-y-4 mt-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search candidates by name, email, headline…"
                value={candSearch}
                onChange={(e) => setCandSearch(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600"
              />
            </div>

            {candsLoading && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Loading candidate talent directory…
              </div>
            )}

            {!candsLoading && filteredCandidates.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400 text-sm">
                No candidate records found.
              </div>
            )}

            {!candsLoading && filteredCandidates.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Headline / Specialization</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredCandidates.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">
                              {c.full_name || "Anonymous Candidate"}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{c.email}</span>
                            <span className="text-[11px] text-slate-500">
                              {c.phone || "No phone listed"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {c.headline || (
                              <span className="text-slate-600 italic">Not provided</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {c.location || (
                              <span className="text-slate-600 italic">Not provided</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(c.created_at).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* JOB CREATION & EDIT MODAL */}
      <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-white">
              {editingJobId ? "Edit Job Vacancy" : "Create & Publish Job Vacancy"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Provide role requirements and placement details for Shivyam hiring partners.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveJobMutation.mutate(jobForm);
            }}
            className="space-y-4 pt-2 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Job Title</Label>
                <Input
                  required
                  placeholder="e.g. Production Executive / Plant Supervisor"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Client / Company Name</Label>
                <Input
                  required
                  placeholder="e.g. Krishna Maruti Limited"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Location</Label>
                <Input
                  required
                  placeholder="e.g. IMT Manesar, Haryana"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Employment Type</Label>
                <select
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 mt-1 outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-300">Work Mode</Label>
                <select
                  value={jobForm.work_mode}
                  onChange={(e) => setJobForm({ ...jobForm, work_mode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 mt-1 outline-none"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Experience Level</Label>
                <select
                  value={jobForm.experience_level}
                  onChange={(e) => setJobForm({ ...jobForm, experience_level: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 mt-1 outline-none"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-300">Min Salary (₹/month or annum)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 250000"
                  value={jobForm.salary_min}
                  onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Max Salary (₹/month or annum)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 450000"
                  value={jobForm.salary_max}
                  onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Job Description</Label>
              <Textarea
                required
                rows={4}
                placeholder="Detail role responsibilities, reporting structure, and day-to-day operations…"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">Requirements & Qualifications</Label>
              <Textarea
                rows={3}
                placeholder="Minimum education qualifications, shifts, skills, or prior factory experience…"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={jobForm.is_active}
                onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 h-4 w-4"
              />
              <Label htmlFor="is_active" className="text-slate-300 text-xs cursor-pointer">
                Publish immediately (Visible to candidate applicants on public website)
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setJobModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveJobMutation.isPending}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
              >
                {saveJobMutation.isPending
                  ? "Saving Record…"
                  : editingJobId
                    ? "Save Changes"
                    : "Publish Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION ALERT */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-white">
              Delete Job Posting?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              This action will remove the job opening from the public portal. All candidate
              applications associated with this job will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && deleteJobMutation.mutate(deleteJobId)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* APPLICATION DOSSIER MODAL */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-base text-white flex items-center justify-between">
              <span>Candidate Dossier</span>
              <Badge className="capitalize text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/30">
                {selectedApp?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Submitted for <strong>{(selectedApp?.jobs as JobRow | null)?.title}</strong> at{" "}
              <strong>{(selectedApp?.jobs as JobRow | null)?.company}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5">
                <p className="text-sm font-semibold text-white">{selectedApp.full_name}</p>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <span>✉ {selectedApp.email}</span>
                  <span>•</span>
                  <span>☎ {selectedApp.phone}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Application ID: <span className="font-mono">{selectedApp.id}</span>
                </p>
              </div>

              {selectedApp.cover_letter && (
                <div>
                  <Label className="text-slate-300 block mb-1">Cover Letter / Note</Label>
                  <p className="rounded-lg bg-slate-950 p-3 text-slate-300 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-slate-300 block mb-1">Candidate Resume</Label>
                {resumeSignedUrl ? (
                  <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3 border border-slate-800">
                    <span className="flex items-center gap-2 text-slate-200">
                      <FileText className="h-4 w-4 text-amber-400" />
                      {selectedApp.resume_path.split("/").pop()}
                    </span>
                    <a
                      href={resumeSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-400"
                    >
                      Download Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    No custom resume file attached to this submission.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Update Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    updateAppStatusMutation.mutate({ id: selectedApp.id, status: newStatus });
                    setSelectedApp({ ...selectedApp, status: newStatus });
                  }}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Not Selected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
