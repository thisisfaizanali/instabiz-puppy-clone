import { NextResponse, type NextRequest } from "next/server";
import { getPuppy } from "@/lib/puppies";

export const config = { matcher: "/puppies/:slug" };

// A puppy page streams its shell before the slug is checked, which would fix the status at 200.
// Rewriting an unknown slug to a path no route matches serves the not-found page with a real 404.
export function proxy(request: NextRequest) {
  if (!getPuppy(request.nextUrl.pathname.split("/")[2])) return NextResponse.rewrite(new URL("/_missing", request.url));
}
