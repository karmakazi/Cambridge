"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginWithMagicLink } from "@/lib/auth";

function MagicLinkHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"verifying" | "success" | "error">(email ? "verifying" : "error");

  useEffect(() => {
    if (!email) return;
    // Simulate token verification delay
    const t = setTimeout(() => {
      loginWithMagicLink(email);
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 800);
    }, 1200);
    return () => clearTimeout(t);
  }, [email, router]);

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
            <Link href="/account-help" className="text-gold text-sm underline">Request a new sign-in link</Link>
            <Link href="/" className="text-white/40 text-xs hover:text-cream">Return to sign in</Link>
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
