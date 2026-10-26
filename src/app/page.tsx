"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, setPendingEmail, loginAsAssistant, loginWithPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, BriefcaseBusiness, Mail, Lock } from "lucide-react";

const EMAIL_CHANGE_REQUEST = `mailto:webhelp@cambridgeforums.com?subject=${encodeURIComponent("Email change request – Cambridge Forums member account")}&body=${encodeURIComponent("Hello Cambridge team,\n\nI have changed firms or no longer have access to the email address on my Cambridge Forums account. Please help me verify my identity and update my email.\n\nFull name:\nFormer email address:\nNew email address:\nFormer firm:\nCurrent firm:\nMost recent Cambridge Forum attended:\n\nThank you.")}`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic-link" | "password">("magic-link");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (auth) router.replace(auth.role === "assistant" ? "/assistant-dashboard" : "/dashboard");
  }, [router]);

  function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setTimeout(() => {
      setPendingEmail(email.trim());
      setSent(true);
      setLoading(false);
    }, 800);
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const auth = loginWithPassword(email.trim(), password);
      router.push(auth.role === "assistant" ? "/assistant-dashboard" : "/dashboard");
    }, 600);
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

      {/* Logo */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex flex-col">
          <span className="font-garamond text-cream text-2xl font-medium tracking-wide">Cambridge</span>
          <span className="label-caps text-gold" style={{ marginTop: -2 }}>Forums</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#2f4566] rounded-lg p-8 border border-white/10">
            {!sent ? (
              <>
                <div className="mb-8">
                  <h1 className="font-garamond text-cream text-3xl font-medium mb-2">
                    Welcome back.
                  </h1>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Sign in to access your forums, member directory, and resources.
                  </p>
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-md overflow-hidden border border-white/10 mb-6">
                  <button
                    onClick={() => { setMode("magic-link"); setError(""); }}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      mode === "magic-link"
                        ? "bg-white/10 text-cream"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    <Mail className="inline w-3.5 h-3.5 mr-1.5" />
                    Magic Link
                  </button>
                  <button
                    onClick={() => { setMode("password"); setError(""); }}
                    className={`flex-1 py-2 text-xs font-medium transition-colors border-l border-white/10 ${
                      mode === "password"
                        ? "bg-white/10 text-cream"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    <Lock className="inline w-3.5 h-3.5 mr-1.5" />
                    Password
                  </button>
                </div>

                {mode === "magic-link" ? (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <div>
                      <label className="label-caps text-white/40 mb-2 block">Email address</label>
                      <Input
                        type="email"
                        placeholder="you@yourfirm.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        className="bg-white/5 border-white/15 text-cream placeholder:text-white/25 focus:border-gold focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoComplete="email"
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#B17E6B] hover:bg-[#C79786] text-white font-medium"
                    >
                      {loading ? "Sending…" : "Send Magic Link"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-white/30 text-xs text-center leading-relaxed">
                      We&apos;ll email you a secure, one-time link. No password needed.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handlePassword} className="space-y-4">
                    <div>
                      <label className="label-caps text-white/40 mb-2 block">Email address</label>
                      <Input
                        type="email"
                        placeholder="you@yourfirm.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        className="bg-white/5 border-white/15 text-cream placeholder:text-white/25 focus:border-gold focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="label-caps text-white/40 mb-2 block">Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        className="bg-white/5 border-white/15 text-cream placeholder:text-white/25 focus:border-gold focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoComplete="current-password"
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#B17E6B] hover:bg-[#C79786] text-white font-medium"
                    >
                      {loading ? "Signing in…" : "Sign In"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-center">
                      <button
                        type="button"
                        onClick={() => { setMode("magic-link"); setError(""); }}
                        className="text-white/30 text-xs hover:text-gold transition-colors"
                      >
                        Prefer a magic link instead?
                      </button>
                    </p>
                  </form>
                )}
                <div className="border-t border-white/10 mt-6 pt-5 text-center">
                  <Link href="/account-help" className="text-white/55 text-xs hover:text-gold transition-colors">Trouble signing in?</Link>
                  <a href={EMAIL_CHANGE_REQUEST} className="mt-2 block text-gold text-xs hover:underline">Changed firms or lost access to your registered email?</a>
                </div>
              </>
            ) : (
              /* Sent state */
              <div className="text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-[#B17E6B]/20 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="font-garamond text-cream text-2xl font-medium mb-2">Check your inbox</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    We&apos;ve sent a secure sign-in link to <span className="text-cream">{email}</span>.
                    The link expires in 15 minutes.
                  </p>
                </div>
                {/* Prototype: simulate clicking the email link */}
                <div className="border-t border-white/10 pt-6">
                  <p className="text-white/30 text-xs mb-3">
                    Prototype demo — simulate clicking the link in the email:
                  </p>
                  <Button
                    onClick={() => router.push(`/magic-link?email=${encodeURIComponent(email)}`)}
                    variant="outline"
                    className="border-white/20 text-cream bg-white/5 hover:bg-white/10 w-full"
                  >
                    Open Magic Link
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                <button
                  onClick={() => setSent(false)}
                  className="text-white/30 text-xs hover:text-white/50 transition-colors"
                >
                  Use a different email
                </button>
                <Link href="/account-help" className="block text-gold/80 text-xs hover:text-gold hover:underline">Link expired or didn&apos;t arrive?</Link>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left">
            <div className="flex items-start gap-3">
              <BriefcaseBusiness className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-cream">Assistant access demo</p>
                <p className="mt-1 text-xs leading-relaxed text-white/45">Preview the restricted workspace for Elena Marchetti’s personal assistant.</p>
                <button
                  type="button"
                  onClick={() => { if (loginAsAssistant("m001")) router.push("/assistant-dashboard"); }}
                  className="mt-3 text-xs font-medium text-gold hover:underline"
                >
                  Sign in as Elena’s assistant <ArrowRight className="ml-1 inline h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/20 text-xs mt-8">
            Cambridge Forums Member Platform · Prototype
          </p>
        </div>
      </main>
    </div>
  );
}
