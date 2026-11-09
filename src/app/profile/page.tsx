"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth, loginAsAssistant } from "@/lib/auth";
import { getResolvedMember } from "@/lib/store";
import { submitProfileUpdate } from "@/lib/prototype-service";
import { MEMBERS, type Member } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Info, Link2, Loader2, Paperclip, ShieldCheck, Upload, X } from "lucide-react";

const CONTACT_PREFS = [
  { value: "email", label: "Show email address", desc: "Your email and phone are visible to other logged-in members." },
  { value: "request-intro", label: "Introductions via Cambridge", desc: "Members see a 'Request an introduction' button. No contact details are shown." },
  { value: "private", label: "Private — contact via Cambridge only", desc: "No contact details visible. Only the Cambridge Team can connect you." },
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";
const EXPERTISE_OPTIONS = Array.from(new Set(MEMBERS.flatMap(member => member.expertise))).sort();
const INTEREST_OPTIONS = [
  "AI and legal practice",
  "Business development and cross-marketing",
  "Cross-border capacity",
  "Digital assets and succession",
  "Family governance",
  "Next-generation client relationships",
  "Professional wellbeing",
  "Settlement strategy",
  "Technology and legal operations",
  "Wealth structuring",
];

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
    interests: "",
    interestResources: [] as NonNullable<Member["interestResources"]>,
    contactPreference: "email" as Member["contactPreference"],
    discoverable: true,
    notifyQaDigest: true,
    notifyQaNewPosts: false,
    notifyQaReplies: false,
    notifyQaMentions: false,
    assistantEnabled: false,
    assistantName: "",
    assistantEmail: "",
    photo: "",
    photoReviewStatus: undefined as Member["photoReviewStatus"],
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [photoError, setPhotoError] = useState("");
  const [otherInterest, setOtherInterest] = useState("");
  const [resourceInterest, setResourceInterest] = useState("");
  const [supportingLink, setSupportingLink] = useState("");
  const [resourceError, setResourceError] = useState("");
  const [professionalStatus, setProfessionalStatus] = useState<"idle" | "draft" | "submitting" | "submitted" | "error">("idle");
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
        interests: (resolvedMember.interests ?? []).join(", "),
        interestResources: resolvedMember.interestResources ?? [],
        contactPreference: resolvedMember.contactPreference,
        discoverable: resolvedMember.discoverable,
        notifyQaDigest: resolvedMember.notifyQaDigest ?? true,
        notifyQaNewPosts: resolvedMember.notifyQaNewPosts ?? false,
        notifyQaReplies: resolvedMember.notifyQaReplies ?? false,
        notifyQaMentions: resolvedMember.notifyQaMentions ?? false,
        assistantEnabled: resolvedMember.assistantAccess?.enabled ?? false,
        assistantName: resolvedMember.assistantAccess?.name ?? "",
        assistantEmail: resolvedMember.assistantAccess?.email ?? "",
        photo: resolvedMember.photo,
        photoReviewStatus: resolvedMember.photoReviewStatus,
      });
    });
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!member || window.location.hash !== "#notifications") return;
    const frame = window.requestAnimationFrame(() => {
      const notifications = document.getElementById("notifications");
      notifications?.scrollIntoView({ behavior: "auto", block: "start" });
      notifications?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [member]);

  useEffect(() => {
    if (!member || saveStatus !== "saving") return;
    const revision = saveRevision.current;
    const timeout = setTimeout(async () => {
      const updates: Partial<Member> = {
        contactPreference: form.contactPreference,
        discoverable: form.discoverable,
        notifyQaNewPosts: form.notifyQaNewPosts,
        notifyQaReplies: form.notifyQaReplies,
        notifyQaMentions: form.notifyQaMentions,
        notifyQaDigest: form.notifyQaDigest,
        assistantAccess: {
          enabled: form.assistantEnabled,
          name: form.assistantName,
          email: form.assistantEmail,
        },
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

  function updateProfessional<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setProfessionalStatus("draft");
  }

  async function submitProfessionalChanges() {
    if (!member) return;
    setProfessionalStatus("submitting");
    try {
      const updates: Partial<Member> = { title: form.title, organization: form.organization, location: form.location, address: form.address, phone: form.phone, bio: form.bio, expertise: form.expertise.split(",").map(value => value.trim()).filter(Boolean), interests: form.interests.split(",").map(value => value.trim()).filter(Boolean), interestResources: form.interestResources };
      const existing = JSON.parse(window.localStorage.getItem("cf_profile_change_requests") ?? "{}");
      window.localStorage.setItem("cf_profile_change_requests", JSON.stringify({ ...existing, [member.id]: { updates, submittedAt: new Date().toISOString(), status: "pending" } }));
      setProfessionalStatus("submitted");
    } catch { setProfessionalStatus("error"); }
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

  function addInterest(value: string) {
    const interests = form.interests.split(",").map(item => item.trim()).filter(Boolean);
    if (!value || interests.includes(value)) return;
    updateProfessional("interests", [...interests, value].join(", "));
    setResourceInterest(current => current || value);
  }

  function removeInterest(value: string) {
    updateProfessional("interests", form.interests.split(",").map(item => item.trim()).filter(item => item && item !== value).join(", "));
    updateProfessional("interestResources", form.interestResources.filter(resource => resource.interest !== value));
    if (resourceInterest === value) setResourceInterest("");
  }

  function addOtherInterest() {
    const value = otherInterest.trim();
    if (!value) return;
    addInterest(value);
    setOtherInterest("");
  }

  function addSupportingLink() {
    setResourceError("");
    if (!resourceInterest) { setResourceError("Choose an area of interest first."); return; }
    try {
      const url = new URL(supportingLink.trim());
      if (url.protocol !== "https:") throw new Error();
      updateProfessional("interestResources", [...form.interestResources, { id: `interest-link-${Date.now()}`, interest: resourceInterest, kind: "link", label: url.hostname.replace(/^www\./, ""), url: url.toString(), visibility: "members" }]);
      setSupportingLink("");
    } catch {
      setResourceError("Enter a complete, secure https:// link.");
    }
  }

  function addSupportingFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setResourceError("");
    if (!file) return;
    if (!resourceInterest) { setResourceError("Choose an area of interest before attaching a file."); event.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setResourceError("Choose a file smaller than 5 MB for this prototype."); event.target.value = ""; return; }
    updateProfessional("interestResources", [...form.interestResources, { id: `interest-file-${Date.now()}`, interest: resourceInterest, kind: "attachment", label: file.name, url: "/materials/prototype-resource.txt", visibility: "members" }]);
    event.target.value = "";
  }

  if (!member) return null;
  const selectedInterests = form.interests.split(",").map(value => value.trim()).filter(Boolean);

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="label-caps text-[#B17E6B] mb-1">My Profile</p>
            <h1 className="font-garamond text-3xl font-medium text-foreground">Edit your profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Personal settings save automatically. Professional changes are submitted to Cambridge for review before the CRM is updated.</p>
          </div>
          <div className="mt-1 min-w-[82px] flex items-center justify-end gap-1.5 text-xs" aria-live="polite">
            {saveStatus === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Saving…</span></>}
            {saveStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-green-700" /><span className="text-green-700">Saved</span></>}
            {saveStatus === "error" && <span className="text-red-700">Try again</span>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <div><h2 className="font-garamond text-base font-medium">Professional Details</h2><p className="text-xs text-muted-foreground mt-1">CRM-managed information · edits are reviewed to protect existing participant data.</p></div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#253855]/10">
                {form.photo ? (
                  <img src={form.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-lg font-semibold text-[#253855]">{member.avatar}</span></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your account name remains managed by Cambridge.</p>
                <label className="mt-2 h-8 w-fit px-3 rounded-md border border-[#253855]/20 bg-white text-xs font-medium text-[#253855] inline-flex items-center gap-1.5 hover:bg-[#253855]/5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />Update photo
                  <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                </label>
              </div>
            </div>

            {form.photoReviewStatus === "pending" && (
              <div className="rounded-md border border-[#B17E6B]/30 bg-[#B17E6B]/[0.06] px-3 py-2 flex items-start gap-2">
                <Clock3 className="w-3.5 h-3.5 text-[#8A5E50] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Photo submitted for review.</span> Cambridge will approve it before it appears to other members.</p>
              </div>
            )}
            {photoError && <p className="text-xs text-red-700">{photoError}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField id="profile-published-name" label="Published name">
                <Input id="profile-published-name" value={form.publishedName} disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground mt-1">How your name should appear in participant lists and materials.</p>
              </ProfileField>
              <ProfileField id="profile-preferred-name" label="Preferred / badge name">
                <Input id="profile-preferred-name" value={form.preferredName} disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground mt-1">How you would like Cambridge and other participants to address you.</p>
              </ProfileField>
            </div>

            <ProfileField id="profile-email" label="Email Address">
              <Input id="profile-email" type="email" value={form.contactEmail} disabled className="bg-muted/40" />
              <a href={`mailto:webhelp@cambridgeforums.com?subject=${encodeURIComponent("Profile name or email change request")}`} className="mt-1.5 inline-block text-xs font-medium text-[#8A5E50] hover:underline">Request a name or email change</a>
            </ProfileField>

            <ProfileField id="profile-title" label="Title">
              <Input id="profile-title" value={form.title} onChange={event => updateProfessional("title", event.target.value)} placeholder="e.g. Managing Partner" />
            </ProfileField>

            <ProfileField id="profile-organization" label="Organisation">
              <Input id="profile-organization" value={form.organization} onChange={event => updateProfessional("organization", event.target.value)} placeholder="e.g. Smith & Associates LLP" />
            </ProfileField>

            <ProfileField id="profile-location" label="Location">
              <Input id="profile-location" value={form.location} onChange={event => updateProfessional("location", event.target.value)} placeholder="e.g. London, United Kingdom" />
            </ProfileField>

            <ProfileField id="profile-address" label="Business Address">
              <Input id="profile-address" value={form.address} onChange={event => updateProfessional("address", event.target.value)} placeholder="e.g. 1 Canada Square, London E14 5AB" />
            </ProfileField>

            <ProfileField id="profile-phone" label="Telephone">
              <Input id="profile-phone" type="tel" value={form.phone} onChange={event => updateProfessional("phone", event.target.value)} placeholder="e.g. +44 20 7946 0312" />
            </ProfileField>

            <ProfileField id="profile-expertise" label="Areas of Expertise">
              <div className="flex flex-wrap gap-1.5 mb-2">{form.expertise.split(",").map(value => value.trim()).filter(Boolean).map(value => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-[#253855]/[0.07] px-2 py-1 text-xs text-[#253855]">{value}<button type="button" onClick={() => updateProfessional("expertise", form.expertise.split(",").map(item => item.trim()).filter(item => item && item !== value).join(", "))}><X className="w-3 h-3"/></button></span>)}</div>
              <select id="profile-expertise" value="" onChange={event => { if (event.target.value) updateProfessional("expertise", [...form.expertise.split(",").map(item => item.trim()).filter(Boolean), event.target.value].join(", ")); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Add an area of expertise…</option>{EXPERTISE_OPTIONS.filter(value => !form.expertise.includes(value)).map(value => <option key={value}>{value}</option>)}</select>
              <p className="text-xs text-muted-foreground mt-1">Standardized options keep directory tags and search results consistent.</p>
            </ProfileField>

            <ProfileField id="profile-interests" label="Areas of Interest">
              <p className="mb-2 text-xs leading-relaxed text-muted-foreground">These interests are visible on your member profile and help Cambridge members find people with related needs or experience.</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedInterests.map(value => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-[#B8C8DD]/35 px-2 py-1 text-xs text-[#253855]">{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => removeInterest(value)}><X className="h-3 w-3"/></button></span>)}
              </div>
              <select id="profile-interests" value="" onChange={event => addInterest(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Add an area of interest…</option>
                {INTEREST_OPTIONS.filter(value => !selectedInterests.includes(value)).map(value => <option key={value}>{value}</option>)}
              </select>
              <div className="mt-2 flex gap-2">
                <Input value={otherInterest} onChange={event => setOtherInterest(event.target.value)} placeholder="Other area of interest" />
                <button type="button" onClick={addOtherInterest} disabled={!otherInterest.trim()} className="h-10 flex-shrink-0 rounded-md border border-[#253855]/20 px-3 text-xs font-medium text-[#253855] hover:bg-[#253855]/5 disabled:opacity-40">Add Other</button>
              </div>

              {selectedInterests.length > 0 && (
                <div className="mt-4 rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#253855]" />
                    <div><p className="text-xs font-medium text-foreground">Supporting material</p><p className="text-[11px] leading-relaxed text-muted-foreground">Optional files and secure links are associated with one interest and available only to signed-in Cambridge members.</p></div>
                  </div>
                  <select value={resourceInterest} onChange={event => setResourceInterest(event.target.value)} className="mt-3 h-9 w-full rounded-md border border-input bg-white px-3 text-xs">
                    <option value="">Choose an interest…</option>
                    {selectedInterests.map(value => <option key={value}>{value}</option>)}
                  </select>
                  <div className="mt-2 flex gap-2">
                    <Input type="url" value={supportingLink} onChange={event => setSupportingLink(event.target.value)} placeholder="https:// secure supporting link" className="h-9 text-xs" />
                    <button type="button" onClick={addSupportingLink} disabled={!supportingLink.trim()} className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-md border border-[#253855]/20 bg-white px-3 text-xs font-medium text-[#253855] hover:bg-[#253855]/5 disabled:opacity-40"><Link2 className="h-3.5 w-3.5"/>Add link</button>
                  </div>
                  <label className="mt-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-[#253855]/20 bg-white px-3 text-xs font-medium text-[#253855] hover:bg-[#253855]/5">
                    <Paperclip className="h-3.5 w-3.5"/>Attach file
                    <input type="file" onChange={addSupportingFile} className="sr-only" />
                  </label>
                  {resourceError && <p className="mt-2 text-xs text-red-700">{resourceError}</p>}
                  {form.interestResources.length > 0 && <div className="mt-3 space-y-2">{form.interestResources.map(resource => <div key={resource.id} className="flex items-start justify-between gap-2 rounded border border-border bg-white p-2"><div className="min-w-0"><p className="truncate text-xs font-medium text-foreground">{resource.label}</p><p className="text-[10px] text-muted-foreground">{resource.interest} · Members only</p></div><button type="button" onClick={() => updateProfessional("interestResources", form.interestResources.filter(item => item.id !== resource.id))} aria-label={`Remove ${resource.label}`} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5"/></button></div>)}</div>}
                </div>
              )}
            </ProfileField>

            <ProfileField id="profile-bio" label="Bio">
              <textarea
                id="profile-bio"
                value={form.bio}
                onChange={event => updateProfessional("bio", event.target.value)}
                rows={4}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="A brief professional biography…"
              />
            </ProfileField>
            <div className="pt-2 flex flex-wrap items-center gap-3"><button type="button" onClick={submitProfessionalChanges} disabled={professionalStatus !== "draft" && professionalStatus !== "error"} className="h-9 px-4 rounded-md bg-[#253855] text-cream text-xs font-medium disabled:opacity-50">{professionalStatus === "submitting" ? "Submitting…" : "Submit changes for review"}</button>{professionalStatus === "submitted" && <span className="text-xs text-green-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/>Submitted to Cambridge for review</span>}{professionalStatus === "error" && <span className="text-xs text-red-700">Please try again.</span>}</div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-garamond text-base font-medium">Contact Preferences</h2>
            <div className="space-y-3">
              {CONTACT_PREFS.map(preference => (
                <label
                  key={preference.value}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    form.contactPreference === preference.value ? "border-[#B17E6B] bg-[#B17E6B]/5" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input type="radio" name="contact" value={preference.value} checked={form.contactPreference === preference.value} onChange={() => updateForm("contactPreference", preference.value)} className="mt-0.5 accent-[#B17E6B]" />
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
            <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${form.discoverable ? "border-[#B17E6B] bg-[#B17E6B]/5" : "border-border"}`}>
              <input type="checkbox" checked={form.discoverable} onChange={event => updateForm("discoverable", event.target.checked)} className="accent-[#B17E6B] w-4 h-4" />
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

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#253855]/[0.07] text-[#253855] flex items-center justify-center flex-shrink-0"><BriefcaseBusiness className="w-4 h-4" /></div>
              <div>
                <h2 className="font-garamond text-base font-medium">Assistant Access</h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Give your personal assistant their own restricted login to help manage your Forum arrangements.</p>
              </div>
            </div>

            <label className={`mt-4 flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${form.assistantEnabled ? "border-[#B17E6B] bg-[#B17E6B]/5" : "border-border"}`}>
              <input type="checkbox" checked={form.assistantEnabled} onChange={event => updateForm("assistantEnabled", event.target.checked)} className="accent-[#B17E6B] w-4 h-4 mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Allow my assistant to manage my Forum details</span>
                <span className="block text-xs text-muted-foreground mt-0.5">You can remove this access at any time.</span>
              </span>
            </label>

            {form.assistantEnabled && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileField id="assistant-name" label="Assistant name"><Input id="assistant-name" value={form.assistantName} onChange={event => updateForm("assistantName", event.target.value)} placeholder="Full name" /></ProfileField>
                  <ProfileField id="assistant-email" label="Assistant email"><Input id="assistant-email" type="email" value={form.assistantEmail} onChange={event => updateForm("assistantEmail", event.target.value)} placeholder="assistant@yourfirm.com" /></ProfileField>
                </div>
                <div className="rounded-md bg-[#253855]/[0.035] border border-[#253855]/10 p-3">
                  <p className="text-xs font-medium flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#B17E6B]" />Restricted, delegated access</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Your assistant can update your attendance, dietary, accessibility and travel details, and view your materials and logistics. They cannot access the Directory, Member Exchange, participant roster, or anyone else’s information.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { if (loginAsAssistant(member.id)) router.push("/assistant-dashboard"); }}
                  className="h-9 px-3 rounded-md border border-[#253855]/20 bg-white text-xs font-medium text-[#253855] inline-flex items-center gap-1.5 hover:bg-[#253855]/5"
                >
                  Preview assistant view <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div id="notifications" tabIndex={-1} className="bg-white rounded-lg border border-border p-6 scroll-mt-6 outline-none transition-shadow target:border-[#B17E6B]/60 target:ring-2 target:ring-[#B17E6B]/20">
            <h2 className="font-garamond text-base font-medium mb-1">Notification Settings</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Start with a quiet weekly summary, then opt in to individual Member Exchange alerts if they are useful.</p>
            <div className="divide-y divide-border">
              {([
                { key: "notifyQaDigest", label: "Weekly Member Exchange digest", desc: "One weekly email summarising new discussions and activity. On by default." },
                { key: "notifyQaNewPosts", label: "New Member Exchange discussions", desc: "New conversations shared with the Cambridge member community." },
                { key: "notifyQaReplies", label: "Replies to my discussions", desc: "Responses to discussions or replies you have contributed." },
                { key: "notifyQaMentions", label: "Mentions", desc: "Member Exchange messages in which another participant mentions you." },
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
                    className="accent-[#B17E6B] w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">Prototype behaviour: preferences are saved in this browser. Production notifications can be delivered through the authenticated member service.</p>
          </div>

          <div className="bg-[#253855]/[0.035] border border-[#253855]/10 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prototype behaviour: personal settings save in this browser. Professional edits are submitted for Cambridge approval before they would sync to the CRM. RSVP and dietary workflows remain unchanged for this review round.
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
