import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { daysAgo } from "@/lib/auth";

const search = z.object({ q: z.string().optional(), location: z.string().optional() });

export const Route = createFileRoute("/jobs/")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Find Jobs — Shivyam Management Services" },
      {
        name: "description",
        content:
          "Browse job openings from Shivyam's hiring partners and find the perfect match for your career.",
      },
      { property: "og:title", content: "Find Your Next Role — Shivyam" },
      {
        property: "og:description",
        content: "Browse job openings from Shivyam's hiring partners.",
      },
    ],
  }),
  component: JobsPage,
});

const filters = {
  job_type: ["Full-time", "Part-time", "Contract", "Freelance"],
  work_mode: ["Remote", "Hybrid", "On-site"],
  experience_level: ["Entry Level", "Mid Level", "Senior Level", "Director"],
} as const;
const titles = { job_type: "Job Type", work_mode: "Work Mode", experience_level: "Experience" };
type Key = keyof typeof filters;

function JobsPage() {
  const sp = Route.useSearch();
  const [q, setQ] = useState(sp.q ?? "");
  const [loc, setLoc] = useState(sp.location ?? "");
  const [sel, setSel] = useState<Record<Key, string[]>>({
    job_type: [],
    work_mode: [],
    experience_level: [],
  });
  const [sort, setSort] = useState<"new" | "salary">("new");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const list = useMemo(() => {
    const kw = q.toLowerCase(),
      l = loc.toLowerCase();
    const out = jobs.filter(
      (j) =>
        (!kw || `${j.title} ${j.company} ${j.description}`.toLowerCase().includes(kw)) &&
        (!l || j.location.toLowerCase().includes(l)) &&
        (Object.keys(sel) as Key[]).every((k) => sel[k].length === 0 || sel[k].includes(j[k])),
    );
    if (sort === "salary") out.sort((a, b) => (b.salary_max ?? 0) - (a.salary_max ?? 0));
    return out;
  }, [jobs, q, loc, sel, sort]);

  const toggle = (k: Key, v: string) =>
    setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  return (
    <main>
      <section className="bg-hero-dots text-hero-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="text-4xl font-bold md:text-5xl">Find Your Next Role</h1>
          <p className="mt-3 text-hero-muted">
            Browse through thousands of job openings and find the perfect match for your career.
          </p>
          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-card p-3 text-foreground sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job Title or Keyword"
                className="h-11 w-full bg-transparent outline-none"
              />
            </label>
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Location"
                className="h-11 w-full bg-transparent outline-none"
              />
            </label>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-primary">Filters</h2>
          {(Object.keys(filters) as Key[]).map((k) => (
            <div key={k} className="mt-6">
              <h3 className="mb-3 font-sans text-sm font-semibold">{titles[k]}</h3>
              {filters[k].map((v) => (
                <label
                  key={v}
                  className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox checked={sel[k].includes(v)} onCheckedChange={() => toggle(k, v)} /> {v}
                </label>
              ))}
            </div>
          ))}
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">{list.length} Jobs Found</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "new" | "salary")}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="new">Newest Postings</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
          {isLoading && <p className="text-muted-foreground">Loading jobs…</p>}
          <div className="space-y-4">
            {list.map((j) => (
              <article
                key={j.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold-soft font-serif text-2xl font-bold text-gold">
                  {j.company[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">
                    <Link to="/jobs/$id" params={{ id: j.id }}>
                      {j.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">{j.company}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                      <MapPin className="h-3 w-3" />
                      {j.location}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1">{j.job_type}</span>
                    <span className="rounded-full bg-muted px-3 py-1">{daysAgo(j.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/jobs/$id" params={{ id: j.id }}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="gold" asChild>
                    <Link to="/jobs/$id/apply" params={{ id: j.id }}>
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
            {!isLoading && list.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                No jobs match your search.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
