import { NextResponse } from "next/server";

import { db, eq } from "@openstatus/db";
import { user, usersToWorkspaces, workspace } from "@openstatus/db/src/schema";

import { auth } from "@/lib/auth";
import { env } from "./env";

export const getValidSubdomain = (host?: string | null) => {
  let subdomain: string | null = null;
  if (!host && typeof window !== "undefined") {
    // On client side, get the host from window
    host = window.location.host;
  }
  // we should improve here for custom vercel deploy page
  if (host && host.includes(".") && !host.includes(".vercel.app")) {
    const candidate = host.split(".")[0];
    if (candidate && !candidate.includes("www")) {
      // Valid candidate
      subdomain = candidate;
    }
  }
  if (host && host.includes("ngrok-free.app")) {
    return null;
  }
  // In case the host is a custom domain
  if (
    host &&
    !(host?.includes(env.NEXT_PUBLIC_URL) || host?.endsWith(".vercel.app"))
  ) {
    subdomain = host;
  }
  return subdomain;
};

const publicAppPaths = [
  "/app/sign-in",
  "/app/sign-up",
  "/app/login",
  "/app/invite",
];

// remove auth middleware if needed
// export const middleware = () => NextResponse.next();

export default auth(async (req) => {
  const url = req.nextUrl.clone();

  if (url.pathname.includes("api/trpc")) {
    return NextResponse.next();
  }

  const host = req.headers.get("host");
  const subdomain = getValidSubdomain(host);

  // Rewriting to status page!
  if (subdomain) {
    url.pathname = `/status-page/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const pathname = req.nextUrl.pathname;

  const isPublicAppPath = publicAppPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!req.auth && pathname.startsWith("/app") && !isPublicAppPath) {
    return NextResponse.redirect(
      new URL(`/app/login?redirectTo=${encodeURIComponent(pathname)}`, req.url),
    );
  }

  if (req.auth && req.auth.user?.id) {
    if (pathname.startsWith("/app") && !isPublicAppPath) {
      const workspaceSlug = req.nextUrl.pathname.split("/")?.[2];
      const hasWorkspaceSlug = !!workspaceSlug && workspaceSlug.trim() !== "";

      const allowedWorkspaces = await db
        .select()
        .from(usersToWorkspaces)
        .innerJoin(user, eq(user.id, usersToWorkspaces.userId))
        .innerJoin(workspace, eq(workspace.id, usersToWorkspaces.workspaceId))
        .where(eq(user.id, parseInt(req.auth.user.id)))
        .all();

      if (hasWorkspaceSlug) {
        const hasAccessToWorkspace = allowedWorkspaces.find(
          ({ workspace }) => workspace.slug === workspaceSlug,
        );
        if (hasAccessToWorkspace) {
          req.cookies.set("workspace-slug", workspaceSlug);
        } else {
          return NextResponse.redirect(new URL("/app", req.url));
        }
      } else {
        if (allowedWorkspaces.length > 0) {
          const firstWorkspace = allowedWorkspaces[0].workspace;
          const { slug } = firstWorkspace;
          return NextResponse.redirect(
            new URL(`/app/${slug}/monitors`, req.url),
          );
        }
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!api|assets|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    "/",
    "/(api/webhook|api/trpc)(.*)",
    "/(!api/checker/:path*|!api/og|!api/ping)",
  ],
};
