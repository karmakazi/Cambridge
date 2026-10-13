"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getResolvedMember, getAllResolvedMembers } from "@/lib/store";
import { FORUMS } from "@/lib/data";
import type { Member, Forum } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Globe, MapPin, Phone, Building2, Users } from "lucide-react";

export default function MemberProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sharedForums, setSharedForums] = useState<Forum[]>([]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.replace("/"); return; }
    setCurrentUserId(auth.memberId);

    const m = getResolvedMember(id);
    if (!m) { router.push("/directory"); return; }
    setMember(m);

    // Find forums shared between current user and this member
    const shared = FORUMS.filter(
      f => f.participants.includes(auth.memberId) && f.participants.includes(id)
    );
    setSharedForums(shared);
  }, [router, id]);

  if (!member) return null;
  const isOwnProfile = currentUserId === member.id;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <Link href="/directory" className="inline-flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Directory
        </Link>

        {/* Profile header */}
        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45]/10">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-[#1e2b45]">{member.avatar}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="font-garamond text-2xl font-medium text-foreground leading-tight">{member.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{member.title}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{member.organization}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {member.steeringCommittee && (
                    <Badge className="bg-[#c8975e]/10 text-[#c8975e] border-0 text-[10px] font-medium">
                      Steering Committee
                    </Badge>
                  )}
                  {isOwnProfile && (
                    <Link href="/profile" className="text-xs text-[#c8975e] hover:underline">Edit profile</Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{member.location}</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{member.jurisdiction}</span>
              </div>

              <div className="mt-2">
                <span className="label-caps text-[#c8975e]">{member.practiceArea}</span>
              </div>
            </div>
          </div>
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
        <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-3">Forum Participation</h2>
          <div className="space-y-2">
            {member.forumsAttended.map(fid => {
              const forum = FORUMS.find(f => f.id === fid);
              if (!forum) return null;
              const dateStr = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(forum.date));
              return (
                <div key={fid} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm text-foreground">{forum.title}</p>
                    <p className="text-xs text-muted-foreground">{forum.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{dateStr}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared forums (if not own profile) */}
        {!isOwnProfile && sharedForums.length > 0 && (
          <div className="bg-white rounded-lg border border-border px-6 py-5 mb-4">
            <h2 className="font-garamond text-base font-medium text-foreground mb-3">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c8975e]" />
                Forums in Common
              </span>
            </h2>
            <div className="space-y-2">
              {sharedForums.map(f => {
                const dateStr = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(f.date));
                return (
                  <div key={f.id} className="flex items-center justify-between py-1">
                    <p className="text-sm text-foreground">{f.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{dateStr}</span>
                      {f.status === "upcoming" && (
                        <Badge className="bg-[#1e2b45] text-cream text-[9px] px-1 h-4">Upcoming</Badge>
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
                ? "Your contact details are hidden. Only Cambridge staff can connect you with other members."
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
                  href={`mailto:webhelp@cambridgeforums.com?subject=Introduction request: ${member.name}`}
                  className="inline-flex items-center gap-2 text-sm text-[#1e2b45] font-medium border border-[#1e2b45]/20 px-4 py-2 rounded-md hover:bg-[#1e2b45]/5 transition-colors"
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
                <a href={`mailto:${member.contactEmail}`} className="text-sm text-[#c8975e] hover:underline">
                  {member.contactEmail}
                </a>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${member.phone}`} className="text-sm text-foreground hover:text-[#c8975e] transition-colors">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.address && (
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
