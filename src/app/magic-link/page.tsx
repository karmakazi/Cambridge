"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithMagicLink } from "@/lib/auth";

function MagicLinkHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const email = params.get("email") ?? "";
    if (!email) {
      setStatus("error");
      return;
    }
    // Simulate token verification delay
    const t = setTimeout(() => {
      loginWithMagicLink(email);
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 800);
    }, 1200);
    return () => clearTimeout(t);
  }, [params, router]);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="flex flex-col items-center mb-4">
          <span className="font-garamond text-cream text-3xl font-medium tracking-wide">Cambridge</span>
          <span className="label-caps text-gold">Forums</span>
        </div>

        {status === "verifying" && (
          <>
            <div className="w-8 h-8 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Verifying your link…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-8 h-8 text-gold text-2xl flex items-center justify-center">✓</div>
            <p className="text-cream text-sm">Signed in. Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-400 text-sm">This link is invalid or has expired.</p>
            <a href="/" className="text-gold text-sm underline">Return to sign in</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense>
      <MagicLinkHandler />
    </Suspense>
  );
}
