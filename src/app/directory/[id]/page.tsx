"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getResolvedMember } from "@/lib/store";
import { FORUMS, getForumEditionSummary } from "@/lib/data";
import type { ForumEditionSummary, Member } from "@/lib/data";
import { getForumHistory, getMemberAnniversaryMilestone, getMemberTenure } from "@/lib/prototype-service";
import { getFavoriteMemberIds, toggleFavoriteMember } from "@/lib/saved-items";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Bookmark, Mail, Globe, MapPin, Phone, Building2, Users, ExternalLink } from "lucide-react";

export default function MemberProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sharedForums, setSharedForums] = useState<ForumEditionSummary[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      setCurrentUserId(auth.memberId);

      const resolvedMember = getResolvedMember(id);
      if (!resolvedMember) { router.push("/directory"); return; }
      setMember(resolvedMember);
      setSaved(getFavoriteMemberIds().includes(resolvedMember.id));

      const currentMember = getResolvedMember(auth.memberId);
      const currentEditions = new Set(currentMember?.forumsAttended ?? []);
      const shared = resolvedMember.forumsAttended
        .filter(forumId => currentEditions.has(forumId))
        .map(getForumEditionSummary)
        .filter((edition): edition is ForumEditionSummary => Boolean(edition))
        .sort((a, b) => b.year - a.year);
      setSharedForums(shared);
    });
    return () => { cancelled = true; };
  }, [router, id]);

  if (!member) return null;
  const isOwnProfile = currentUserId === member.id;
  const tenure = getMemberTenure(member);
  const forumHistory = getForumHistory(member);
  const displayName = member.publishedName || member.name;
  const milestoneYears = getMemberAnniversaryMilestone(member);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to previous page
        </button>

        {/* Profile header */}
        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#253855]/10">
              {member.photo ? (
                <img src={member.photo} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-[#253855]">{member.avatar}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="font-garamond text-2xl font-medium text-foreground leading-tight">{displayName}</h1>
                  {member.preferredName && member.preferredName !== displayName && <p className="text-xs text-muted-foreground mt-0.5">Preferred name: {member.preferredName}</p>}
                  <p className="text-muted-foreground text-sm mt-0.5">{member.title}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{member.organization}</p>
                </div>
                <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-1">
                  {member.isCambridgeStaff && <Badge className="bg-[#253855] text-white border-0 text-[10px] font-medium">Cambridge Team</Badge>}
                  {tenure.count > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {tenure.count}-time participant{tenure.firstYear ? ` · since ${tenure.firstYear}` : ""}
                    </span>
                  )}
                  {milestoneYears && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A5E50]">
                      <Award className="h-3 w-3" aria-hidden="true" />{milestoneYears}-year anniversary attendee
                    </span>
                  )}
                  {isOwnProfile && (
                    <Link href="/profile" className="text-xs text-[#B17E6B] hover:underline">Edit profile</Link>
                  )}
                  {!isOwnProfile && !member.isCambridgeStaff && (
                    <button type="button" onClick={() => setSaved(toggleFavoriteMember(member.id).includes(member.id))} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${saved ? "border-[#B17E6B] bg-[#B17E6B]/10 text-[#7A5144]" : "border-[#253855]/20 text-[#253855] hover:bg-[#253855]/5"}`}>
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />{saved ? "Saved" : "Save participant"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{member.location}</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{member.jurisdiction}</span>
              </div>

              <div className="mt-2">
                <span className="label-caps text-[#B17E6B]">{member.practiceArea}</span>
              </div>
            </div>
          </div>
          {milestoneYears && tenure.firstYear && (
            <div className="mt-5 rounded-md border-l-4 border-[#B17E6B] bg-[#B17E6B]/10 px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B17E6B] text-white flex items-center justify-center flex-shrink-0"><Award className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-medium text-foreground">Celebrating {displayName}’s {milestoneYears}-year anniversary</p>
                <p className="text-xs text-muted-foreground mt-0.5">A Cambridge Forums attendee since {tenure.firstYear}. Attendance does not need to be consecutive.</p>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
        </div>

        {/* Expertise */}
        <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-3">Areas of Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {member.expertise.map(e => (
              <span key={e} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{e}</span>
            ))}
          </div>
        </div>

        {/* Forum history */}
        {!member.isCambridgeStaff && <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-3">Forum Participation</h2>
          <div className="space-y-2">
            {forumHistory.map(edition => {
              return (
                <div key={edition.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{edition.title}</p>
                    <p className="text-xs text-muted-foreground">{edition.location}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{edition.year}</span>
                    {member.steeringCommitteeForums.includes(edition.id) && (
                      <Badge className="bg-[#B17E6B]/10 text-[#8A5E50] border-0 text-[9px] font-medium">
                        Steering Committee
                      </Badge>
                    )}
                    {member.coChairForums?.includes(edition.id) && (
                      <Badge className="bg-[#253855] text-cream border-0 text-[9px] font-medium">
                        Committee Co-Chair
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* Shared forums (if not own profile) */}
        {!member.isCambridgeStaff && !isOwnProfile && sharedForums.length > 0 && (
          <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
            <h2 className="font-garamond text-base font-medium text-foreground mb-3">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B17E6B]" />
                Forums Attended Together
              </span>
            </h2>
            <div className="space-y-2">
              {sharedForums.map(f => {
                const status = FORUMS.find(forum => forum.id === f.id)?.status;
                return (
                  <div key={f.id} className="flex items-center justify-between py-1">
                    <div><p className="text-sm text-foreground">{f.title}</p><p className="text-xs text-muted-foreground">{f.location}</p></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{f.year}</span>
                      {status === "upcoming" && (
                        <Badge className="bg-[#253855] text-cream text-[9px] px-1 h-4">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-lg border border-border px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-garamond text-base font-medium text-foreground">Contact</h2>
            {isOwnProfile && (
              <span className="text-[10px] label-caps text-muted-foreground bg-muted px-2 py-0.5 rounded">
                What others see
              </span>
            )}
          </div>
          {member.contactPreference === "private" ? (
            <p className="text-sm text-muted-foreground italic">
              {isOwnProfile
                ? "Your contact details are hidden. Only the Cambridge Team can connect you with other members."
                : "This member has set their contact information as private. Contact through Cambridge Forums."}
            </p>
          ) : member.contactPreference === "request-intro" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isOwnProfile
                  ? "Other members will be invited to request an introduction through Cambridge."
                  : "This member prefers to be introduced through Cambridge Forums."}
              </p>
              {!isOwnProfile && (
                <a
                  href={`mailto:webhelp@cambridgeforums.com?subject=Introduction request: ${displayName}`}
                  className="inline-flex items-center gap-2 text-sm text-[#253855] font-medium border border-[#253855]/20 px-4 py-2 rounded-md hover:bg-[#253855]/5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Request an introduction
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${member.contactEmail}`} className="text-sm text-[#B17E6B] hover:underline">
                  {member.contactEmail}
                </a>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${member.phone}`} className="text-sm text-foreground hover:text-[#B17E6B] transition-colors">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.address && (
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(member.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[#8A5E50] hover:underline"
                    >
                      Open in Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
