"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getResolvedMember } from "@/lib/store";
import { submitProfileUpdate } from "@/lib/prototype-service";
import type { Member } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock3, Info, Loader2, Upload } from "lucide-react";

const CONTACT_PREFS = [
  { value: "email", label: "Show email address", desc: "Your email and phone are visible to other logged-in members." },
  { value: "request-intro", label: "Introductions via Cambridge", desc: "Members see a 'Request an introduction' button. No contact details are shown." },
  { value: "private", label: "Private — contact via Cambridge only", desc: "No contact details visible. Only Cambridge staff can connect you." },
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    publishedName: "",
    preferredName: "",
    contactEmail: "",
    title: "",
    organization: "",
    location: "",
    address: "",
    phone: "",
    bio: "",
    expertise: "",
    contactPreference: "email" as Member["contactPreference"],
    discoverable: true,
    notifyQaNewPosts: true,
    notifyQaReplies: true,
    notifyQaMentions: true,
    photo: "",
    photoReviewStatus: undefined as Member["photoReviewStatus"],
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [photoError, setPhotoError] = useState("");
  const saveRevision = useRef(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      const resolvedMember = getResolvedMember(auth.memberId);
      if (!resolvedMember) { router.replace("/"); return; }
      setMember(resolvedMember);
      setForm({
        publishedName: resolvedMember.publishedName ?? resolvedMember.name,
        preferredName: resolvedMember.preferredName ?? resolvedMember.name.split(" ")[0],
        contactEmail: resolvedMember.contactEmail,
        title: resolvedMember.title,
        organization: resolvedMember.organization,
        location: resolvedMember.location,
        address: resolvedMember.address ?? "",
        phone: resolvedMember.phone ?? "",
        bio: resolvedMember.bio,
        expertise: resolvedMember.expertise.join(", "),
        contactPreference: resolvedMember.contactPreference,
        discoverable: resolvedMember.discoverable,
        notifyQaNewPosts: resolvedMember.notifyQaNewPosts ?? true,
        notifyQaReplies: resolvedMember.notifyQaReplies ?? true,
        notifyQaMentions: resolvedMember.notifyQaMentions ?? true,
        photo: resolvedMember.photo,
        photoReviewStatus: resolvedMember.photoReviewStatus,
      });
    });
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!member || saveStatus !== "saving") return;
    const revision = saveRevision.current;
    const timeout = setTimeout(async () => {
      const updates: Partial<Member> = {
        publishedName: form.publishedName,
        preferredName: form.preferredName,
        contactEmail: form.contactEmail,
        title: form.title,
        organization: form.organization,
        location: form.location,
        address: form.address,
        phone: form.phone,
        bio: form.bio,
        expertise: form.expertise.split(",").map(value => value.trim()).filter(Boolean),
        contactPreference: form.contactPreference,
        discoverable: form.discoverable,
        notifyQaNewPosts: form.notifyQaNewPosts,
        notifyQaReplies: form.notifyQaReplies,
        notifyQaMentions: form.notifyQaMentions,
        photo: form.photo,
        photoReviewStatus: form.photoReviewStatus,
      };

      try {
        await submitProfileUpdate(member.id, updates);
        if (revision !== saveRevision.current) return;
        setMember(current => current ? { ...current, ...updates } : current);
        setSaveStatus("saved");
      } catch {
        if (revision === saveRevision.current) setSaveStatus("error");
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [form, member, saveStatus]);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    saveRevision.current += 1;
    setForm(current => ({ ...current, [key]: value }));
    setSaveStatus("saving");
  }

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose a JPG, PNG, or other image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 2 MB for this prototype.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      saveRevision.current += 1;
      setForm(current => ({ ...current, photo: reader.result as string, photoReviewStatus: "pending" }));
      setSaveStatus("saving");
    };
    reader.onerror = () => setPhotoError("That image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  }

  if (!member) return null;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="label-caps text-[#c8975e] mb-1">My Profile</p>
            <h1 className="font-garamond text-3xl font-medium text-foreground">Edit your profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Changes are saved automatically shortly after every edit.</p>
          </div>
          <div className="mt-1 min-w-[82px] flex items-center justify-end gap-1.5 text-xs" aria-live="polite">
            {saveStatus === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Saving…</span></>}
            {saveStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-green-700" /><span className="text-green-700">Saved</span></>}
            {saveStatus === "error" && <span className="text-red-700">Try again</span>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-garamond text-base font-medium">Professional Details</h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45]/10">
                {form.photo ? (
                  <img src={form.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-lg font-semibold text-[#1e2b45]">{member.avatar}</span></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your account name remains managed by Cambridge.</p>
                <label className="mt-2 h-8 w-fit px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />Update photo
                  <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                </label>
              </div>
            </div>

            {form.photoReviewStatus === "pending" && (
              <div className="rounded-md border border-[#c8975e]/30 bg-[#c8975e]/[0.06] px-3 py-2 flex items-start gap-2">
                <Clock3 className="w-3.5 h-3.5 text-[#9a6a33] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Photo submitted for review.</span> Cambridge will approve it before it appears to other members.</p>
              </div>
            )}
            {photoError && <p className="text-xs text-red-700">{photoError}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField id="profile-published-name" label="Published name">
                <Input id="profile-published-name" value={form.publishedName} onChange={event => updateForm("publishedName", event.target.value)} placeholder="Name shown in the roster" />
                <p className="text-xs text-muted-foreground mt-1">How your name should appear in participant lists and materials.</p>
              </ProfileField>
              <ProfileField id="profile-preferred-name" label="Preferred / badge name">
                <Input id="profile-preferred-name" value={form.preferredName} onChange={event => updateForm("preferredName", event.target.value)} placeholder="Name used in person" />
                <p className="text-xs text-muted-foreground mt-1">How you would like Cambridge and other participants to address you.</p>
              </ProfileField>
            </div>

            <ProfileField id="profile-email" label="Email Address">
              <Input id="profile-email" type="email" value={form.contactEmail} onChange={event => updateForm("contactEmail", event.target.value)} placeholder="e.g. name@yourfirm.com" />
            </ProfileField>

            <ProfileField id="profile-title" label="Title">
              <Input id="profile-title" value={form.title} onChange={event => updateForm("title", event.target.value)} placeholder="e.g. Managing Partner" />
            </ProfileField>

            <ProfileField id="profile-organization" label="Organisation">
              <Input id="profile-organization" value={form.organization} onChange={event => updateForm("organization", event.target.value)} placeholder="e.g. Smith & Associates LLP" />
            </ProfileField>

            <ProfileField id="profile-location" label="Location">
              <Input id="profile-location" value={form.location} onChange={event => updateForm("location", event.target.value)} placeholder="e.g. London, United Kingdom" />
            </ProfileField>

            <ProfileField id="profile-address" label="Business Address">
              <Input id="profile-address" value={form.address} onChange={event => updateForm("address", event.target.value)} placeholder="e.g. 1 Canada Square, London E14 5AB" />
            </ProfileField>

            <ProfileField id="profile-phone" label="Telephone">
              <Input id="profile-phone" type="tel" value={form.phone} onChange={event => updateForm("phone", event.target.value)} placeholder="e.g. +44 20 7946 0312" />
            </ProfileField>

            <ProfileField id="profile-expertise" label="Areas of Expertise">
              <Input id="profile-expertise" value={form.expertise} onChange={event => updateForm("expertise", event.target.value)} placeholder="e.g. Competition Law, Merger Control, State Aid" />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated. These appear as tags in the directory.</p>
            </ProfileField>

            <ProfileField id="profile-bio" label="Bio">
              <textarea
                id="profile-bio"
                value={form.bio}
                onChange={event => updateForm("bio", event.target.value)}
                rows={4}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="A brief professional biography…"
              />
            </ProfileField>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-garamond text-base font-medium">Contact Preferences</h2>
            <div className="space-y-3">
              {CONTACT_PREFS.map(preference => (
                <label
                  key={preference.value}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    form.contactPreference === preference.value ? "border-[#c8975e] bg-[#c8975e]/5" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input type="radio" name="contact" value={preference.value} checked={form.contactPreference === preference.value} onChange={() => updateForm("contactPreference", preference.value)} className="mt-0.5 accent-[#c8975e]" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{preference.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{preference.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="font-garamond text-base font-medium mb-1">Cross-Forum Discovery</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              When enabled, members from other Cambridge forums can find you. When disabled, only people in your forum network can view your profile.
            </p>
            <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${form.discoverable ? "border-[#c8975e] bg-[#c8975e]/5" : "border-border"}`}>
              <input type="checkbox" checked={form.discoverable} onChange={event => updateForm("discoverable", event.target.checked)} className="accent-[#c8975e] w-4 h-4" />
              <span>
                <span className="block text-sm font-medium">Allow cross-forum discovery</span>
                <span className="block text-xs text-muted-foreground">Other Cambridge members can find you even if you haven&apos;t shared a forum.</span>
              </span>
            </label>

            {!form.discoverable && (
              <div className="mt-3 flex items-start gap-2 bg-muted/40 rounded p-3">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">You will only appear to members in your forum network. You can change this at any time.</p>
              </div>
            )}
          </div>

          <div id="notifications" className="bg-white rounded-lg border border-border p-6 scroll-mt-6">
            <h2 className="font-garamond text-base font-medium mb-1">Notification Settings</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Member Q&amp;A notifications are on by default. Choose which activity you want to hear about.</p>
            <div className="divide-y divide-border">
              {([
                { key: "notifyQaNewPosts", label: "New Q&A posts", desc: "New questions posted in sessions for your registered Forums." },
                { key: "notifyQaReplies", label: "Replies to my posts", desc: "Responses to questions or replies you have contributed." },
                { key: "notifyQaMentions", label: "Mentions", desc: "Messages in which another participant mentions you." },
              ] as const).map(option => (
                <label key={option.key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer">
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{option.desc}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form[option.key]}
                    onChange={event => updateForm(option.key, event.target.checked)}
                    className="accent-[#c8975e] w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">Prototype behaviour: preferences are saved in this browser. Production notifications can be delivered through the authenticated member service.</p>
          </div>

          <div className="bg-[#1e2b45]/[0.035] border border-[#1e2b45]/10 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prototype behaviour: edits save in this browser after a short pause. The production app can send the same updates through the CRM API.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label-caps text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
