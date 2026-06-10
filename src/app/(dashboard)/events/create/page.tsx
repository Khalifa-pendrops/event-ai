"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * DEPRECATED route.
 * The active event creation wizard lives at /dashboard/events/create
 * (nested under the (dashboard)/dashboard group so the URL is correct).
 * This file auto-redirects to the real one to avoid confusion / 404s from earlier path experiments.
 */
export default function DeprecatedCreateRoute() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/events/create");
  }, [router]);
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#f5f0e6]">
      Redirecting to the current event creation flow…
    </div>
  );
}
