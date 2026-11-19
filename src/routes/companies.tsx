import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Award,
  Building,
  CheckCircle2,
  Clock,
  Handshake,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "For Employers & Companies — Shivyam Management Services" },
      {
        name: "description",
        content:
          "Partner with Shivyam Management Services Pvt Ltd for executive search, industrial staffing, and specialized recruitment across India.",
      },
    ],
  }),
  component: CompaniesPage,
});

const employerSchema = z.object({
  company_name: z.string().trim().min(2, "Company name is required").max(150),
  contact_person: z.string().trim().min(2, "Contact person name is required").max(100),
  email: z.string().trim().email("Please enter a valid work email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s-]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
  staffing_scope: z.enum([
    "bulk_staffing",
    "executive_search",
    "contract_staffing",
    "permanent_recruitment",
  ]),
  location: z.string().trim().min(2, "Job / Plant location is required").max(100),
  requirements: z
    .string()
    .trim()
    .min(10, "Please describe your hiring requirements (minimum 10 characters)")
    .max(2500),
});

function CompaniesPage() {
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    staffing_scope: "permanent_recruitment" as const,
    location: "IMT Manesar / Delhi NCR",
    requirements: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = employerSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please complete all required fields");
      return;
    }

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
      toast.success(
        "Partnership requisition received. A corporate account manager will contact you.",
      );
      setForm({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        staffing_scope: "permanent_recruitment",
        location: "IMT Manesar / Delhi NCR",
        requirements: "",
      });
    }, 600);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-dots text-hero-foreground py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 bg-hero/50 px-4 py-1.5 text-xs font-semibold text-gold">
            Institutional Employer Solutions
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight md:text-6xl max-w-4xl mx-auto leading-tight">
            Strategic Workforce Solutions for{" "}
            <em className="text-gold not-italic">Industry Leaders</em>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-hero-muted leading-relaxed">
            Accelerate your hiring cycle with pre-screened talent, verified qualifications, and
            scalable staffing models designed to support organizational growth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#partner-form"
              className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground hover:bg-gold/90 transition-colors"
            >
              Submit Hiring Requisition
            </a>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/contact">Speak with a Consultant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Shivyam for Enterprise Staffing */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
            Employer Benefits
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-primary md:text-4xl">
            Why Hiring Partners Trust Shivyam
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            We deliver the operational reliability and compliance demanded by India's top
            automotive, manufacturing, and commercial enterprises.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">Pre-Screened Talent</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every candidate undergoes structured initial evaluations, skill verification, and
              background checks before presentation.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">Accelerated Turnaround</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With an active candidate database spanning key industrial corridors, we significantly
              reduce time-to-hire for critical roles.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">100% Statutory Compliance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full adherence to Indian labor statutes, documented contracts, and transparent
              operational practices across every staffing engagement.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">Flexible Staffing Models</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tailored staffing arrangements including contract staffing, contract-to-hire, and full
              permanent placements.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">
              Executive Search Discretion
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Confidential talent search for C-suite, plant general managers, and specialized
              functional directors.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Handshake className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">Dedicated Account Lead</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A dedicated staffing manager coordinates your requisition, candidate interview
              schedules, and post-placement onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Partner Spotlight */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-card">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
                  Verified Hiring Partner
                </span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-primary">
                  Krishna Maruti Limited
                </h2>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  Shivyam Management Services actively supports operations at Krishna Maruti
                  Limited's manufacturing facilities in IMT Manesar, Haryana. Our placement pipeline
                  delivers certified line support, production helpers, and quality-conscious talent
                  directly to the shop floor.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground">
                    Plant Location: IMT Manesar, Haryana
                  </div>
                  <div className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground">
                    Industry: Automotive & Manufacturing
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-hero-dots p-8 text-hero-foreground">
                <h3 className="font-serif text-2xl font-bold text-white">
                  Need Qualified Personnel for Your Facility?
                </h3>
                <p className="mt-2 text-xs md:text-sm text-hero-muted leading-relaxed">
                  Join industry leaders relying on Shivyam Management Services for rapid workforce
                  mobilization and consistent placement quality.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-hero-muted">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-gold" /> +91 70684 73074
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-gold" /> business@shivyamservices.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Requisition Form */}
      <section id="partner-form" className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-card">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
              Corporate Inquiry
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary">
              Submit Your Hiring Requirements
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Provide your workforce requisition details below. Our corporate relations team will
              connect with you within 24 business hours.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-xl bg-gold-soft/50 border border-gold/30 p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-gold-foreground font-bold text-xl">
                ✓
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">Requisition Received</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for considering Shivyam Management Services as your recruitment partner.
                An account manager has been assigned to your requisition.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs"
              >
                Submit Another Requirement
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company / Organization Name</Label>
                  <Input
                    id="company_name"
                    required
                    placeholder="e.g. Maruti Suzuki Vendor / Apex Logistics"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_person">Contact Person & Designation</Label>
                  <Input
                    id="contact_person"
                    required
                    placeholder="e.g. Anita Roy (Head of HR)"
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="work_email">Official Work Email</Label>
                  <Input
                    id="work_email"
                    type="email"
                    required
                    placeholder="hr@yourcompany.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="work_phone">Direct Phone Number</Label>
                  <Input
                    id="work_phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staffing_scope">Engagement Scope</Label>
                  <select
                    id="staffing_scope"
                    value={form.staffing_scope}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        staffing_scope: e.target.value as typeof form.staffing_scope,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground mt-1 outline-none"
                  >
                    <option value="permanent_recruitment">Permanent Recruitment</option>
                    <option value="contract_staffing">Contract / Temporary Staffing</option>
                    <option value="bulk_staffing">Bulk / Shop Floor Workforce</option>
                    <option value="executive_search">Executive & Leadership Search</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="plant_location">Target Work / Plant Location</Label>
                  <Input
                    id="plant_location"
                    required
                    placeholder="e.g. IMT Manesar, Gurugram, or Delhi NCR"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="req_details">Requisition Overview & Roles Needed</Label>
                <Textarea
                  id="req_details"
                  rows={4}
                  required
                  placeholder="Mention number of positions, desired skills, shifts, experience range, and estimated hiring timeline..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={busy}
                className="w-full font-semibold"
              >
                {busy ? "Submitting Requisition…" : "Submit Hiring Requisition"}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground pt-1">
                You can also email your detailed JD directly to{" "}
                <a
                  href="mailto:business@shivyamservices.com"
                  className="text-primary font-medium hover:underline"
                >
                  business@shivyamservices.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
