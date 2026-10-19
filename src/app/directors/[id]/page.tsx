"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Mail, Phone } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { FORUMS, getForumDirectorById, type ForumDirector } from "@/lib/data";

export default function ForumDirectorProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [director, setDirector] = useState<ForumDirector | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!getAuth()) {
        router.replace("/");
        return;
      }
      const resolvedDirector = getForumDirectorById(id);
      if (!resolvedDirector) {
        router.replace("/dashboard");
        return;
      }
      setDirector(resolvedDirector);
    });
    return () => { cancelled = true; };
  }, [id, router]);

  if (!director) return null;

  const directedForums = FORUMS.filter(
    (forum) => forum.logistics.contactEmail.toLowerCase() === director.contactEmail.toLowerCase(),
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Forums
        </Link>

        <div className="bg-white rounded-lg border border-border p-5 sm:p-6 mb-4">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 bg-[#1e2b45] text-cream flex items-center justify-center">
              <span className="font-garamond text-xl sm:text-2xl font-medium">{director.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="label-caps text-[#9a6a33] mb-1">Your Forum Director</p>
              <h1 className="font-garamond text-2xl font-medium text-foreground leading-tight">{director.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{director.title}</p>
              <p className="text-sm font-medium text-foreground">{director.organization}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border px-5 sm:px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-2">How Sarah can help</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{director.bio}</p>
        </div>

        <div className="bg-white rounded-lg border border-border px-5 sm:px-6 py-5 mb-4">
          <h2 className="font-garamond text-base font-medium text-foreground mb-4">Contact</h2>
          <div className="space-y-3">
            <a href={`mailto:${director.contactEmail}`} className="flex items-center gap-2.5 text-sm text-[#9a6a33] hover:underline break-all">
              <Mail className="w-4 h-4 flex-shrink-0" />{director.contactEmail}
            </a>
            <a href={`tel:${director.contactPhone}`} className="flex items-center gap-2.5 text-sm text-foreground hover:text-[#9a6a33] transition-colors">
              <Phone className="w-4 h-4 flex-shrink-0" />{director.contactPhone}
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border px-5 sm:px-6 py-5">
          <h2 className="font-garamond text-base font-medium text-foreground mb-3">Forums supported</h2>
          <div className="space-y-3">
            {directedForums.map((forum) => (
              <div key={forum.id} className="flex items-start gap-2.5">
                <BriefcaseBusiness className="w-4 h-4 text-[#c8975e] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{forum.title}</p>
                  <p className="text-xs text-muted-foreground">{forum.editionYear} · {forum.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
