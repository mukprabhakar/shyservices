import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={logo.url}
        alt="Shivyam Management Services Logo"
        className="h-12 w-12 rounded-full border border-border bg-card object-contain p-0.5"
      />
      <span className="leading-tight">
        <span className="block font-serif text-xl font-bold text-primary">SHIVYAM</span>
        <span className="block text-[11px] font-semibold tracking-[0.18em] text-gold">
          MANAGEMENT SERVICES
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="hidden border-b border-border md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <span>People &nbsp;|&nbsp; Process &nbsp;|&nbsp; Performance</span>
          <span className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-gold" />
            <a href="tel:+917068473074">+91 70684 73074</a> |{" "}
            <a href="tel:+919050848737">+91 90508 48737</a>
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="border-b-2 border-transparent py-1 text-sm font-medium text-foreground/80 hover:text-primary"
              activeProps={{ className: "!border-gold !text-primary font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Button variant="navy" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium">
                Sign In
              </Link>
              <Button variant="navy" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Button variant="navy" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Button variant="navy" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
