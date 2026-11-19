import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Award,
  BarChart3,
  Briefcase,
  Compass,
  GraduationCap,
  Handshake,
  LineChart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import meeting from "@/assets/business-meeting.png.asset.json";

const HERO =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Shivyam Management Services — Connecting Top Talent with India's Leading Companies",
      },
      {
        name: "description",
        content:
          "Discover premium opportunities in management, finance and operations with Shivyam Management Services Pvt Ltd.",
      },
      { property: "og:title", content: "Shivyam Management Services" },
      {
        property: "og:description",
        content: "Connecting top talent with India's leading companies.",
      },
      { property: "og:image", content: HERO },
      { name: "twitter:image", content: HERO },
    ],
  }),
  component: Home,
});

const trending = ["Leadership", "Management", "Finance", "Operations", "Consulting", "HR"];

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const { data: count = 0 } = useQuery({
    queryKey: ["jobs-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      return count ?? 0;
    },
  });
  const go = (keyword = q) =>
    navigate({ to: "/jobs", search: { q: keyword || undefined, location: loc || undefined } });

  return (
    <main>
      {/* Hero */}
      <section className="bg-hero-dots text-hero-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 px-4 py-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-gold" /> Trusted by Top Enterprises
            </span>
            <h1 className="mt-8 text-5xl font-bold leading-[1.1] md:text-7xl">
              Connecting <br />
              <em className="text-gold">Top Talent</em>
              <br />
              <span className="text-4xl md:text-6xl">with India's Leading Companies</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-hero-muted">
              Connect with elite organizations and discover premium opportunities in management,
              finance, and operations. Your next big career move starts here.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go();
              }}
              className="mt-8 flex flex-col gap-3 rounded-2xl bg-card p-3 text-foreground sm:flex-row"
            >
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
              <Button type="submit" variant="gold" size="lg" className="h-12 text-base">
                Search
              </Button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-hero-muted">Trending:</span>
              {trending.map((t) => (
                <button
                  key={t}
                  onClick={() => go(t)}
                  className="rounded-full border border-hero-foreground/25 px-4 py-1.5 hover:bg-hero-foreground/10"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={HERO}
              alt="Corporate Professionals"
              className="aspect-[5/4] w-full rounded-3xl object-cover shadow-card"
            />
            <StatCard
              className="-left-6 top-10"
              icon={<Briefcase className="h-5 w-5 text-gold" />}
              label="Active Jobs"
              value={`${count}+`}
            />
            <StatCard
              className="-left-10 bottom-16"
              icon={<UserCheck className="h-5 w-5" />}
              label="Premium Placements"
              value="98% Success"
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <div className="relative">
          <img
            src={meeting.url}
            alt="Business Meeting"
            className="aspect-square w-full rounded-3xl object-cover shadow-card"
          />
          <div className="absolute -bottom-6 right-6 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-card">
            <p className="font-serif text-lg font-bold text-gold">Premium Tier</p>
            <p className="text-sm">Exclusive Access</p>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-primary md:text-5xl">
            Why Industry Leaders <em className="text-gold">Choose Us</em>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We provide the premier infrastructure for high-level professionals to discover, connect,
            and secure roles at the world's most innovative organizations.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Feature
              icon={<Target />}
              title="Precision Matching"
              text="Our proprietary algorithm ensures you only see opportunities that perfectly align with your career trajectory."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Verified Partners"
              text="We partner exclusively with vetted, top-tier enterprises to guarantee the quality of every position."
            />
            <Feature
              icon={<Users />}
              title="Executive Network"
              text="Gain access to an exclusive network of industry leaders and hiring managers."
            />
            <Feature
              icon={<TrendingUp />}
              title="Career Advancement"
              text="Accelerate your professional growth with opportunities designed for high-achievers."
            />
          </div>
        </div>
      </section>

      <AboutBlock />

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-gold">
          The Process
        </p>
        <h2 className="mt-2 text-center text-4xl font-bold text-primary md:text-5xl">
          How Shivyam Works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          A streamlined, four-step journey from profile creation to your next career milestone.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "photo-1565728744382-61accd4aa148",
              "Create Your Profile",
              "Build a comprehensive professional profile highlighting your skills, experience, and career ambitions.",
            ],
            [
              "photo-1517245386807-bb43f82c33c4",
              "Discover Opportunities",
              "Our intelligent matching engine surfaces only the most relevant, high-value positions for your profile.",
            ],
            [
              "photo-1507003211169-0a1dd7228f2d",
              "Apply with Confidence",
              "Submit polished applications with one click, backed by our expert preparation resources.",
            ],
            [
              "photo-1521791136064-7986c2920216",
              "Land Your Role",
              "Get placed in a premium position and accelerate your career to new heights.",
            ],
          ].map(([img, t, d], i) => (
            <div
              key={t}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="relative">
                <img
                  src={`https://images.unsplash.com/${img}?q=80&w=800&auto=format&fit=crop`}
                  alt={t}
                  className="h-48 w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 font-serif font-bold text-gold-foreground">
                  0{i + 1}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI */}
      <section className="bg-hero-dots text-hero-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-gold" /> AI-Powered Platform
            </span>
            <h2 className="mt-6 text-4xl font-bold md:text-5xl">
              Intelligent Tools for <em className="text-gold">Elite Placement</em>
            </h2>
            <p className="mt-4 text-hero-muted">
              Leverage cutting-edge AI to position yourself ahead of the competition and connect
              with roles that truly match your executive potential.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                [
                  <FileText key="a" />,
                  "Resume Intelligence",
                  "AI-powered feedback that optimizes your profile for ATS systems and human reviewers alike.",
                ],
                [
                  <GraduationCap key="b" />,
                  "Executive Coaching",
                  "Personalized AI guidance to help you articulate your value proposition and ace senior-level interviews.",
                ],
                [
                  <BarChart3 key="c" />,
                  "Market Intelligence",
                  "Real-time salary benchmarking and compensation data to ensure you negotiate from a position of strength.",
                ],
                [
                  <Target key="d" />,
                  "Precision Matching",
                  "Proprietary algorithms surface only the highest-relevance opportunities for your unique profile.",
                ],
              ].map(([icon, t, d]) => (
                <div key={t as string} className="rounded-2xl border border-hero-foreground/10 p-5">
                  <div className="text-gold">{icon}</div>
                  <h3 className="mt-3 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-hero-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=2070&auto=format&fit=crop"
              alt="AI Technology Dashboard"
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
            <StatCard
              className="-left-4 top-8"
              icon={<LineChart className="h-5 w-5 text-gold" />}
              label="AI Match Score"
              value="98%"
              sub="Perfect Alignment"
            />
            <StatCard
              className="-right-4 bottom-8"
              icon={<Award className="h-5 w-5 text-gold" />}
              label="New Matches Today"
              value="47"
              sub="Senior Roles"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
          alt="Team collaboration"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero/85" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center text-hero-foreground">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Join 50,000+ Professionals Today
          </p>
          <h2 className="mt-4 text-4xl font-bold md:text-6xl">
            Your Next Chapter <em className="text-gold">Starts Here.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-hero-muted">
            Connect with elite organizations, unlock exclusive opportunities, and take the next step
            in your career.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AboutBlock() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">About Us</p>
          <h2 className="mt-2 text-4xl font-bold text-primary md:text-5xl">
            About Shivyam Management Services Pvt Ltd
          </h2>
          <p className="mt-4 text-muted-foreground">
            We are a premier recruitment and staffing firm dedicated to bridging the gap between
            top-tier talent and industry-leading organizations. Our holistic approach ensures
            long-term success for both candidates and employers.
          </p>
          <div className="mt-8 space-y-5">
            {[
              [
                <Briefcase key="1" />,
                "Recruitment Services",
                "End-to-end talent acquisition tailored to your unique organizational needs.",
              ],
              [
                <Award key="2" />,
                "Executive Hiring",
                "Discrete and specialized search for C-suite and senior leadership roles.",
              ],
              [
                <Users key="3" />,
                "Staffing Solutions",
                "Flexible, scalable staffing models from contract to permanent placements.",
              ],
              [
                <Compass key="4" />,
                "Career Guidance",
                "Expert counseling and resources to help professionals navigate their career paths.",
              ],
              [
                <Handshake key="5" />,
                "Employer Hiring Support",
                "Comprehensive support for HR teams to streamline the hiring process.",
              ],
            ].map(([icon, t, d]) => (
              <div key={t as string} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                  {icon}
                </div>
                <div>
                  <h4 className="font-semibold text-primary">{t}</h4>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="Our Team"
            className="aspect-[4/5] w-full rounded-3xl object-cover shadow-card"
          />
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-gold px-6 py-5 text-gold-foreground shadow-gold">
            <p className="font-serif text-4xl font-bold">10+</p>
            <p className="text-sm font-medium">
              Years of
              <br />
              Excellence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  className,
  icon,
  label,
  value,
  sub,
}: {
  className: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className={`absolute hidden items-center gap-4 rounded-2xl bg-card p-4 pr-6 text-foreground shadow-card sm:flex ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-serif text-2xl font-bold text-primary">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-gold">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
