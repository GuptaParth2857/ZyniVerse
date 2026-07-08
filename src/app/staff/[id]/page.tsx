"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getStaffBasic, getStaffMedia, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import type { StaffFull } from "@/lib/anilist";

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }

function formatBirthday(dob: { year?: number; month?: number; day?: number } | undefined) {
  if (!dob?.month && !dob?.day) return null;
  const d = new Date(2000, (dob.month || 1) - 1, dob.day || 1);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + (dob.year ? `, ${dob.year}` : "");
}

function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 50%)`;
}

export default function StaffPage() {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<StaffFull | null>(null);
  const [mediaEdges, setMediaEdges] = useState<StaffFull["staffMedia"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setStaff(null);
    window.scrollTo(0, 0);
    getStaffBasic(id!)
      .then((d) => !cancelled && setStaff(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setMediaLoading(true); setMediaEdges(undefined);
    getStaffMedia(id!)
      .then((d) => !cancelled && setMediaEdges(d))
      .catch(() => !cancelled && setMediaEdges(undefined))
      .finally(() => !cancelled && setMediaLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  const accent = useMemo(() => hashColor(staff?.name?.full), [staff?.name?.full]);
  const edges = mediaEdges?.edges || [];

  if (loading) return <Loader label="Loading staff..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!staff) return null;

  const birthday = formatBirthday(staff.dateOfBirth);

  return (
    <PageTransition><div>
      {/* ── Hero ── */}
      <div className="relative min-h-[50vh] border-b border-[var(--color-line)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 40%, ${accent}33, transparent 70%)` }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 60%, ${accent}15, var(--color-void) 70%)` }} />

        <div className="relative z-10 mx-auto flex h-full min-h-[50vh] max-w-7xl items-center px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8 w-full">
            {/* Staff Portrait */}
            <div className="shrink-0 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full opacity-40 blur-2xl" style={{ background: accent }} />
                <div className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-full border-4" style={{ borderColor: accent }}>
                  <Image
                    src={staff.image?.large || ""}
                    alt={staff.name?.full || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 224px, 256px"
                  />
                </div>
                {staff.favourites != null && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-black/70 px-4 py-1 text-sm backdrop-blur border" style={{ borderColor: accent }}>
                    <span style={{ color: accent }}>♥</span>
                    <span className="font-bold font-mono" style={{ color: accent }}>{staff.favourites.toLocaleString()}</span>
                    <span className="text-[var(--color-mute)] text-xs">favorites</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl font-bold sm:text-5xl drop-shadow-lg">{staff.name?.full}</h1>
              {staff.name?.native && <p className="mt-1 text-lg text-[var(--color-mute)]">{staff.name.native}</p>}

              {staff.description && (
                <p className="mt-4 leading-relaxed text-sm text-[var(--color-mute)] whitespace-pre-line">
                  {stripHtml(staff.description)}
                </p>
              )}

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {staff.gender && <StatCard accent={accent} label="Gender" value={staff.gender} />}
                {staff.age && <StatCard accent={accent} label="Age" value={staff.age} />}
                {birthday && <StatCard accent={accent} label="Birthday" value={birthday} />}
                {staff.homeTown && <StatCard accent={accent} label="Hometown" value={staff.homeTown} />}
              </div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {staff.yearsActive && <StatCard accent={accent} label="Active" value={staff.yearsActive} />}
                {edges.length > 0 && (
                  <StatCard accent={accent} label="Productions" value={String(edges.length)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Works by Year ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {mediaLoading && (
          <div className="flex justify-center py-10">
            <Loader label="Loading works..." />
          </div>
        )}

        {!mediaLoading && edges.length > 0 && (() => {
          const byYear = new Map<number, typeof edges>();
          edges.forEach((e) => {
            const y = e.node.startDate?.year || 0;
            if (!byYear.has(y)) byYear.set(y, []);
            byYear.get(y)!.push(e);
          });
          const sortedYears = [...byYear.keys()].sort((a, b) => b - a);
          return (
            <>
              <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
                Works ({edges.length})
              </h2>
              {sortedYears.map((year) => (
                <div key={year} className="mb-6">
                  <h3 className="font-display text-base font-semibold mb-3 text-[var(--color-mute)] flex items-center gap-2">
                    <span className="font-mono text-xs">{year || "Unknown"}</span>
                    <span className="h-px flex-1 bg-[var(--color-line)]" />
                  </h3>
                  <div className="space-y-2">
                    {byYear.get(year)!.map((edge, i) => {
                      const m = edge.node;
                      const mediaAccent = m.coverImage?.color || accent;
                      return (
                        <Link key={`${m.id}-${i}`}
                          href={m.type === "MANGA" ? `/manga/${m.id}` : `/anime/${m.id}`}
                          className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all group-hover:w-1.5" style={{ background: mediaAccent }} />
                          <div className="relative shrink-0 h-20 w-14 rounded-lg border border-[var(--color-line)] overflow-hidden">
                            <Image src={m.coverImage?.large || ""} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{bestTitle(m.title)}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {m.format && <span className="text-[10px] text-[var(--color-mute)]">{m.format}</span>}
                              {m.meanScore ? <span className="text-xs">★ {(m.meanScore / 10).toFixed(1)}</span> : null}
                              {m.episodes ? <span className="text-[10px] text-[var(--color-mute)]">{m.episodes} ep</span> : null}
                              <span className="text-[10px] text-[var(--color-mute)] capitalize">{m.status?.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                          <span className="text-[var(--color-mute)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          );
        })()}

        {!mediaLoading && edges.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-mute)]">No media found for this staff member.</p>
        )}

        <div className="mt-8 text-center text-xs text-[var(--color-mute)]">
          Data from <a href={staff.siteUrl || "#"} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">AniList</a>.
        </div>
      </div>
    </div></PageTransition>
  );
}

function StatCard({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="text-sm font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}