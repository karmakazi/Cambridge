"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LifeBuoy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setPendingEmail } from "@/lib/auth";

const EMAIL_CHANGE_REQUEST = `mailto:webhelp@cambridgeforums.com?subject=${encodeURIComponent("Email change request – Cambridge Forums member account")}&body=${encodeURIComponent("Hello Cambridge team,\n\nI have changed firms or no longer have access to the email address on my Cambridge Forums account. Please help me verify my identity and update my email.\n\nFull name:\nFormer email address:\nNew email address:\nFormer firm:\nCurrent firm:\nMost recent Cambridge Forum attended:\n\nThank you.")}`;

export default function AccountHelpPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function requestLink(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the email address associated with your Cambridge account.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setPendingEmail(email.trim());
      setLoading(false);
      setSent(true);
    }, 700);
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <header className="px-6 sm:px-8 py-6">
        <div className="flex flex-col">
          <span className="font-garamond text-cream text-2xl font-medium tracking-wide">Cambridge</span>
          <span className="label-caps text-gold" style={{ marginTop: -2 }}>Forums</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-cream text-xs mb-4"><ArrowLeft className="w-3.5 h-3.5" />Back to sign in</Link>
          <div className="bg-[#2f4566] rounded-lg p-6 sm:p-8 border border-white/10">
            {!sent ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#B17E6B]/15 flex items-center justify-center mb-5"><LifeBuoy className="w-5 h-5 text-gold" /></div>
                <h1 className="font-garamond text-cream text-3xl font-medium">Trouble signing in?</h1>
                <p className="text-white/50 text-sm leading-relaxed mt-2">Request a fresh sign-in link if your previous link expired, you forgot your password, or your account is locked.</p>

                <form onSubmit={requestLink} className="space-y-4 mt-6">
                  <div>
                    <label htmlFor="recovery-email" className="label-caps text-white/40 mb-2 block">Account email</label>
                    <Input id="recovery-email" type="email" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} placeholder="you@yourfirm.com" autoComplete="email" className="bg-white/5 border-white/15 text-cream placeholder:text-white/25 focus:border-gold focus-visible:ring-0 focus-visible:ring-offset-0" />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <Button type="submit" disabled={loading} className="w-full bg-[#B17E6B] hover:bg-[#C79786] text-white font-medium"><Mail className="mr-2 w-4 h-4" />{loading ? "Sending…" : "Send a new sign-in link"}</Button>
                </form>

                <div className="border-t border-white/10 mt-6 pt-5">
                  <p className="text-cream text-sm font-medium">Changed firms or lost access to your email?</p>
                  <p className="mt-1 text-white/50 text-xs leading-relaxed">Cambridge can verify your identity and update the email address on your member record.</p>
                  <a href={EMAIL_CHANGE_REQUEST} className="mt-2 inline-flex text-gold text-xs font-medium hover:underline">Request an email change</a>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#B17E6B]/15 flex items-center justify-center mx-auto"><CheckCircle2 className="w-6 h-6 text-gold" /></div>
                <h1 className="font-garamond text-cream text-2xl font-medium mt-5">Check your inbox</h1>
                <p className="text-white/50 text-sm leading-relaxed mt-2">If an account matches <span className="text-cream">{email}</span>, Cambridge will send a fresh sign-in link. It will expire after 15 minutes.</p>
                <div className="border-t border-white/10 mt-6 pt-5 space-y-3">
                  <p className="text-white/30 text-xs">Prototype demo</p>
                  <Link href={`/magic-link?email=${encodeURIComponent(email)}`} className="h-9 w-full rounded-md border border-white/20 bg-white/5 text-cream text-sm font-medium inline-flex items-center justify-center hover:bg-white/10">Open new sign-in link</Link>
                  <button type="button" onClick={() => setSent(false)} className="block mx-auto text-white/40 text-xs hover:text-cream">Try another email</button>
                </div>
              </div>
            )}
          </div>
          <p className="text-center text-white/20 text-xs mt-8">Cambridge Forums Member Platform · Prototype</p>
        </div>
      </main>
    </div>
  );
}
