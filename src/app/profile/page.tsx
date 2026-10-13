"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getResolvedMember, saveProfile } from "@/lib/store";
import type { Member } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, Info } from "lucide-react";

const CONTACT_PREFS = [
  { value: "email", label: "Show email address", desc: "Your email and phone are visible to other logged-in members." },
  { value: "request-intro", label: "Introductions via Cambridge", desc: "Members see a 'Request an introduction' button. No contact details are shown." },
  { value: "private", label: "Private — contact via Cambridge only", desc: "No contact details visible. Only Cambridge staff can connect you." },
] as const;

type SaveStatus = "idle" | "saving" | "saved";

export default function ProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    title: "",
    organization: "",
    location: "",
    address: "",
    phone: "",
    bio: "",
    expertise: "",
    contactPreference: "email" as Member["contactPreference"],
    discoverable: true,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const memberRef = useRef<Member | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.replace("/"); return; }
    const m = getResolvedMember(auth.memberId);
    if (!m) return;
    setMember(m);
    memberRef.current = m;
    setForm({
      title: m.title,
      organization: m.organization,
      location: m.location,
      address: m.address ?? "",
      phone: m.phone ?? "",
      bio: m.bio,
      expertise: m.expertise.join(", "),
      contactPreference: m.contactPreference,
      discoverable: m.discoverable,
    });
  }, [router]);

  // Auto-save: debounce 1s after any form change
  const doSave = useCallback((currentForm: typeof form, currentMember: Member) => {
    setSaveStatus("saving");
    const updates: Partial<Member> = {
      title: currentForm.title,
      organization: currentForm.organization,
      location: currentForm.location,
      address: currentForm.address,
      phone: currentForm.phone,
      bio: currentForm.bio,
      expertise: currentForm.expertise.split(",").map(s => s.trim()).filter(Boolean),
      contactPreference: currentForm.contactPreference,
      discoverable: currentForm.discoverable,
    };
    saveProfile(currentMember.id, updates);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, []);

  useEffect(() => {
    // Skip the initial population of the form
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!memberRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("saving");
    const m = memberRef.current;
    debounceRef.current = setTimeout(() => doSave(form, m), 900);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form, doSave]);

  if (!member) return null;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-10">

        {/* Header with auto-save status */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="label-caps text-[#c8975e] mb-1">My Profile</p>
            <h1 className="font-garamond text-3xl font-medium text-foreground">Edit your profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Control what other members see in the directory.
            </p>
          </div>
          {/* Save status indicator */}
          <div className="mt-1 flex items-center gap-1.5 text-xs min-w-[80px] justify-end">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                <span className="text-muted-foreground">Saving…</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Professional details */}
          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-garamond text-base font-medium">Professional Details</h2>

            {/* Photo + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45]/10">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-[#1e2b45]">{member.avatar}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Contact Cambridge to update your name or photo.</p>
              </div>
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Title</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Managing Partner"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Organisation</label>
              <Input
                value={form.organization}
                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                placeholder="e.g. Smith & Associates LLP"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Location</label>
              <Input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. London, United Kingdom"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Business Address</label>
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 1 Canada Square, London E14 5AB"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Telephone</label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +44 20 7946 0312"
                type="tel"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Areas of Expertise</label>
              <Input
                value={form.expertise}
                onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))}
                placeholder="e.g. Competition Law, Merger Control, State Aid"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated. These appear as tags in the directory.</p>
            </div>

            <div>
              <label className="label-caps text-muted-foreground mb-1.5 block">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="A brief professional biography…"
              />
            </div>
          </div>

          {/* Contact preferences */}
          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-garamond text-base font-medium">Contact Preferences</h2>
            <div className="space-y-3">
              {CONTACT_PREFS.map(pref => (
                <label
                  key={pref.value}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    form.contactPreference === pref.value
                      ? "border-[#c8975e] bg-[#c8975e]/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="contact"
                    value={pref.value}
                    checked={form.contactPreference === pref.value}
                    onChange={() => setForm(f => ({ ...f, contactPreference: pref.value }))}
                    className="mt-0.5 accent-[#c8975e]"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cross-forum discovery */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="font-garamond text-base font-medium mb-1">Cross-Forum Discovery</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              When enabled, members from other Cambridge forums can find you in the directory. When disabled, only members who have attended a forum with you can view your profile.
            </p>
            <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
              form.discoverable ? "border-[#c8975e] bg-[#c8975e]/5" : "border-border"
            }`}>
              <input
                type="checkbox"
                checked={form.discoverable}
                onChange={e => setForm(f => ({ ...f, discoverable: e.target.checked }))}
                className="accent-[#c8975e] w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">Allow cross-forum discovery</p>
                <p className="text-xs text-muted-foreground">Other Cambridge members can find you even if you haven't shared a forum.</p>
              </div>
            </label>

            {!form.discoverable && (
              <div className="mt-3 flex items-start gap-2 bg-muted/40 rounded p-3">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  You will only appear in the directory to members who have attended a forum with you. You can change this at any time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
