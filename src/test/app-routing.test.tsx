import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.routeId).toBe("/");
  });

  it("matches a page for /about", () => {
    const matches = router.matchRoutes("/about");
    expect(matches.at(-1)?.routeId).toBe("/about");
  });

  it("matches a page for /companies", () => {
    const matches = router.matchRoutes("/companies");
    expect(matches.at(-1)?.routeId).toBe("/companies");
  });

  it("matches a page for /contact", () => {
    const matches = router.matchRoutes("/contact");
    expect(matches.at(-1)?.routeId).toBe("/contact");
  });

  it("matches a page for /login", () => {
    const matches = router.matchRoutes("/login");
    expect(matches.at(-1)?.routeId).toBe("/login");
  });

  it("matches a page for /register", () => {
    const matches = router.matchRoutes("/register");
    expect(matches.at(-1)?.routeId).toBe("/register");
  });

  it("matches a page for /forgot-password", () => {
    const matches = router.matchRoutes("/forgot-password");
    expect(matches.at(-1)?.routeId).toBe("/forgot-password");
  });

  it("matches a page for /reset-password", () => {
    const matches = router.matchRoutes("/reset-password");
    expect(matches.at(-1)?.routeId).toBe("/reset-password");
  });

  it("matches a page for /dashboard", () => {
    const matches = router.matchRoutes("/dashboard");
    expect(matches.at(-1)?.routeId).toBe("/dashboard");
  });

  it("matches a page for /jobs", () => {
    const matches = router.matchRoutes("/jobs");
    expect(matches.at(-1)?.routeId).toBe("/jobs/");
  });

  it("matches a page for /jobs/:id", () => {
    const matches = router.matchRoutes("/jobs/sample-uuid-123");
    expect(matches.at(-1)?.routeId).toBe("/jobs/$id/");
  });

  it("matches a page for /jobs/:id/apply", () => {
    const matches = router.matchRoutes("/jobs/sample-uuid-123/apply");
    expect(matches.at(-1)?.routeId).toBe("/jobs/$id/apply");
  });

  it("matches a page for /admin", () => {
    const matches = router.matchRoutes("/admin");
    expect(matches.at(-1)?.routeId).toBe("/admin/");
  });

  it("matches a page for /admin/login", () => {
    const matches = router.matchRoutes("/admin/login");
    expect(matches.at(-1)?.routeId).toBe("/admin/login");
  });
});
