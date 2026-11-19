import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Clock, MapPin, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { daysAgo } from "@/lib/auth";

export const Route = createFileRoute("/jobs/$id/")({
  head: () => ({
    meta: [
      { title: "Job Details — Shivyam Management Services" },
      {
        name: "description",
        content: "View the role, requirements and apply through Shivyam Management Services.",
      },
      { property: "og:title", content: "Job Details — Shivyam" },
      { property: "og:description", content: "View the role and apply through Shivyam." },
    ],
  }),
  component: JobDetail,
});

export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function JobDetail() {
  const { id } = Route.useParams();
  const { data: job, isLoading } = useJob(id);
  if (isLoading)
    return <p className="mx-auto max-w-4xl px-6 py-20 text-muted-foreground">Loading…</p>;
  if (!job)
    return (
      <p className="mx-auto max-w-4xl px-6 py-20">
        This job is no longer available.{" "}
        <Link to="/jobs" className="text-gold underline">
          Browse jobs
        </Link>
      </p>
    );
  return (
    <main>
      <section className="bg-hero-dots text-hero-foreground">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Link to="/jobs" className="text-sm text-hero-muted">
            ← Back to jobs
          </Link>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">{job.title}</h1>
          <p className="mt-2 text-lg text-gold">{job.company}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.job_type}
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              {job.work_mode}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {daysAgo(job.created_at)}
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">Job Description</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <h2 className="text-2xl font-bold text-primary">Requirements</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{job.requirements}</p>
            </div>
          )}
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Experience</p>
          <p className="font-semibold">{job.experience_level}</p>
          {job.salary_max && (
            <>
              <p className="mt-4 text-sm text-muted-foreground">Salary</p>
              <p className="font-semibold">
                ₹{job.salary_min?.toLocaleString("en-IN")} – ₹
                {job.salary_max.toLocaleString("en-IN")}
              </p>
            </>
          )}
          <Button variant="gold" className="mt-6 w-full" asChild>
            <Link to="/jobs/$id/apply" params={{ id: job.id }}>
              Apply Now
            </Link>
          </Button>
        </aside>
      </section>
    </main>
  );
}
