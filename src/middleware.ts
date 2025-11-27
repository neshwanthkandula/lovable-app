import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",           // ✔ public API allowed
]);

export default clerkMiddleware(async (authFn, req) => {
  const auth = await authFn();

  if (!isPublicRoute(req) && !auth.userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("returnBackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // ✔ required for Clerk + tRPC
    "/(api/trpc)(.*)",

    // ✔ Clerk recommended matcher
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
  ],
};
