import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Compass,
  Handshake,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import meeting from "@/assets/business-meeting.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Shivyam Management Services Private Limited" },
      {
        name: "description",
        content:
          "Learn about Shivyam Management Services Pvt Ltd — our mission, recruitment methodologies, staffing solutions, and executive search services across India.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-dots text-hero-foreground py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 bg-hero/50 px-4 py-1.5 text-xs font-semibold text-gold">
            <span className="h-2 w-2 rounded-full bg-gold" /> People | Process | Performance
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-6xl max-w-4xl mx-auto leading-tight">
            Bridging the Gap Between <em className="text-gold not-italic">Top-Tier Talent</em> and
            India's Leading Enterprises
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-hero-muted leading-relaxed">
            Shivyam Management Services Private Limited is a premier recruitment and staffing firm.
            We provide the infrastructure and expertise required to connect high-caliber
            professionals with organizations built for long-term growth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to="/jobs">Find Opportunities</Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/contact">Contact Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Values */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold mb-5">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary">Our Mission</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed text-sm md:text-base">
              To empower India's leading industrial, corporate, and operational enterprises with
              exceptional human capital while providing ambitious professionals with clear pathways
              to meaningful career advancement.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold mb-5">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary">Our Vision</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed text-sm md:text-base">
              To be India's most dependable and performance-driven recruitment consultancy,
              respected for unwavering integrity, thorough candidate evaluation, and sustained
              organizational impact.
            </p>
          </div>
        </div>

        {/* Three Pillars */}
        <div className="mt-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
            Guiding Principles
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-primary md:text-4xl">
            The Three Pillars of Shivyam
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-serif text-3xl font-bold text-gold">01</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-primary">People First</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We believe that organizational greatness is founded on genuine human potential. We
                prioritize long-term cultural alignment and mutual respect for both employer and
                employee.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-serif text-3xl font-bold text-gold">02</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-primary">Process Excellence</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Our structured vetting, compliant documentation, and multi-stage assessment models
                ensure precision and reliability in every placement cycle.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-serif text-3xl font-bold text-gold">03</span>
              <h3 className="mt-4 font-serif text-xl font-bold text-primary">Performance Driven</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We measure our success by candidate retention, productivity on the shop floor or
                executive suite, and enduring corporate partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
              Our Capabilities
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary md:text-4xl">
              End-to-End Staffing & Recruitment Services
            </h2>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Tailored workforce solutions designed to meet the operational demands of high-growth
              manufacturing, technology, and corporate enterprises.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Briefcase className="h-6 w-6" />,
                title: "Recruitment Services",
                desc: "End-to-end talent acquisition tailored to your unique organizational culture and technical requirements.",
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: "Executive Hiring",
                desc: "Discrete, specialized search mandates for senior management, plant leadership, and executive positions.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Staffing Solutions",
                desc: "Flexible, scalable staffing models ranging from contractual and project-based deployments to permanent hires.",
              },
              {
                icon: <Compass className="h-6 w-6" />,
                title: "Career Guidance",
                desc: "Expert counseling, resume feedback, and preparation resources to help professionals reach their potential.",
              },
              {
                icon: <Handshake className="h-6 w-6" />,
                title: "Employer Hiring Support",
                desc: "Dedicated support for corporate HR teams to manage applicant flow, schedule evaluations, and streamline onboarding.",
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Verification & Compliance",
                desc: "Diligent background checks, credential authentication, and regulatory compliance standards across all placements.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-card hover:border-gold/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold mb-4">
                  {s.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-primary">{s.title}</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Heritage Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
              Shivyam Management Services
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary md:text-4xl">
              A Decade of Dedicated Placement Excellence
            </h2>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
              With over 10 years of collective industry experience, Shivyam Management Services
              Private Limited has built a strong reputation across regional industrial corridors
              including Gurugram, IMT Manesar, Delhi NCR, and beyond.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Established relationships with certified industrial and corporate manufacturing clients",
                "Proven recruitment workflows with pre-screened candidate pools",
                "Dedicated HR account managers for institutional employers",
                "Zero-compromise data privacy and ethical talent representation",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button variant="navy" asChild>
                <Link to="/companies">Explore Corporate Solutions</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={meeting.url}
              alt="Shivyam Management Services Leadership & Team"
              className="aspect-square w-full rounded-3xl object-cover shadow-card"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-gold p-6 text-gold-foreground shadow-gold">
              <p className="font-serif text-4xl font-bold">10+</p>
              <p className="text-xs md:text-sm font-medium">
                Years of Staffing
                <br />
                Excellence
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
