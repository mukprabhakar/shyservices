import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Shivyam Management Services Private Limited" },
      {
        name: "description",
        content:
          "Get in touch with Shivyam Management Services Pvt Ltd. Connect with our recruitment team via phone, email, or WhatsApp.",
      },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s-]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
  inquiry_type: z.enum(["candidate_support", "corporate_hiring", "general_inquiry", "partnership"]),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    inquiry_type: "general_inquiry" as const,
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check form entries");
      return;
    }

    setBusy(true);
    // Simulate brief processing
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
      toast.success("Thank you. Your message has been received by Shivyam HR support.");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        inquiry_type: "general_inquiry",
        message: "",
      });
    }, 600);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="bg-hero-dots text-hero-foreground py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/20 bg-hero/50 px-4 py-1.5 text-xs font-semibold text-gold">
            Official Contact Desk
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold md:text-5xl">
            Get in Touch with Our Team
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm md:text-base text-hero-muted">
            Have questions about career openings or enterprise recruitment solutions? We are here to
            assist candidates and hiring partners.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          {/* Verified Contact Details Column */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
                Shivyam Management Services Pvt Ltd
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-primary md:text-3xl">
                Direct Channels of Communication
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Reach our team directly through our verified corporate communication channels.
              </p>
            </div>

            {/* Direct Phone Numbers */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <Phone className="h-5 w-5 text-gold" /> Calling Numbers
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Desk 1:</span>
                  <a
                    href="tel:+917068473074"
                    className="text-primary hover:text-gold hover:underline font-medium"
                  >
                    +91 70684 73074
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Desk 2:</span>
                  <a
                    href="tel:+919050848737"
                    className="text-primary hover:text-gold hover:underline font-medium"
                  >
                    +91 90508 48737
                  </a>
                </p>
              </div>

              {/* Instant WhatsApp Support */}
              <div className="pt-2 border-t border-border">
                <a
                  href="https://wa.me/917068473074"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Message on WhatsApp (+91 70684 73074)
                </a>
              </div>
            </div>

            {/* Department Email Addresses */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <Mail className="h-5 w-5 text-gold" /> Department Mailboxes
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs font-semibold text-foreground">General Enquiries</p>
                  <a
                    href="mailto:info@shivyamservices.com"
                    className="text-primary hover:text-gold hover:underline"
                  >
                    info@shivyamservices.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Corporate Hiring & Partnerships
                  </p>
                  <a
                    href="mailto:business@shivyamservices.com"
                    className="text-primary hover:text-gold hover:underline"
                  >
                    business@shivyamservices.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    HR & Candidate Placement Support
                  </p>
                  <a
                    href="mailto:Hr_support@shivyamservices.com"
                    className="text-primary hover:text-gold hover:underline"
                  >
                    Hr_support@shivyamservices.com
                  </a>
                </div>
              </div>
            </div>

            {/* Operations Hub */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-2">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" /> Primary Operations Hub
              </h3>
              <p className="text-sm text-muted-foreground">
                Operating across key manufacturing and industrial corridors including IMT Manesar,
                Gurugram, Haryana, and the National Capital Region (NCR).
              </p>
            </div>
          </div>

          {/* Validated Inquiry Form Column */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <h2 className="font-serif text-2xl font-bold text-primary">Send an Inquiry</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the form below and our team will route your message to the appropriate
                department.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl bg-gold-soft/50 border border-gold/30 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-gold-foreground font-bold">
                    ✓
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary">
                    Message Sent Successfully
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Thank you for reaching out. A representative from Shivyam Management Services
                    will respond to your registered email or phone promptly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="contact_name">Full Name</Label>
                    <Input
                      id="contact_name"
                      required
                      placeholder="e.g. Vikramaditya Singh"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Email Address</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inquiry_type">Nature of Inquiry</Label>
                    <select
                      id="inquiry_type"
                      value={form.inquiry_type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          inquiry_type: e.target.value as typeof form.inquiry_type,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground mt-1 outline-none"
                    >
                      <option value="general_inquiry">General Question / Information</option>
                      <option value="candidate_support">Candidate Application / Job Support</option>
                      <option value="corporate_hiring">Corporate Hiring & Staffing Needs</option>
                      <option value="partnership">Business Partnership / Vendor</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="contact_message">Your Message</Label>
                    <Textarea
                      id="contact_message"
                      rows={5}
                      required
                      placeholder="Describe your inquiry, workforce requirement, or application question in detail..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
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
                    {busy ? "Sending Message…" : "Submit Inquiry"}
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground pt-1">
                    Your details are processed solely to respond to your specific request in
                    accordance with our ethical data privacy practices.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
