import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="Shivyam logo"
              className="h-12 w-12 rounded-full bg-card object-contain p-0.5"
            />
            <span>
              <span className="block font-serif text-xl font-bold">SHIVYAM</span>
              <span className="block text-[11px] tracking-[0.18em] text-gold">
                MANAGEMENT SERVICES
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm text-hero-muted">
            Connecting top talent with India's leading companies. People | Process | Performance.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-gold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-hero-muted">
            <li>
              <Link to="/jobs">Find Jobs</Link>
            </li>
            <li>
              <Link to="/companies">Companies</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-gold">For Candidates</h4>
          <ul className="space-y-2 text-sm text-hero-muted">
            <li>
              <Link to="/register">Create Account</Link>
            </li>
            <li>
              <Link to="/login">Sign In</Link>
            </li>
            <li>
              <Link to="/dashboard">My Dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-hero-muted">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 70684 73074
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 90508 48737
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <a href="https://wa.me/917068473074">WhatsApp</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:info@shivyamservices.com">info@shivyamservices.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:business@shivyamservices.com">business@shivyamservices.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:Hr_support@shivyamservices.com">Hr_support@shivyamservices.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hero-foreground/10 py-5 text-center text-xs text-hero-muted">
        © {new Date().getFullYear()} Shivyam Management Services Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}
