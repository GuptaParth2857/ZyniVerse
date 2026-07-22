"use client";

import { useState } from "react";

interface CalendarSyncProps {
  animeId: number;
  title: string;
  nextEpisode?: {
    episode: number;
    airDate: string;
    timeUntil?: string;
  };
  className?: string;
}

export default function CalendarSync({ animeId, title, nextEpisode, className = "" }: CalendarSyncProps) {
  const [synced, setSynced] = useState(false);

  const generateICalEvent = () => {
    if (!nextEpisode) return "";
    
    const startDate = new Date(nextEpisode.airDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    const formatICalDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZyniVerse//Anime Schedule//EN
BEGIN:VEVENT
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${title} - Episode ${nextEpisode.episode}
DESCRIPTION:Watch ${title} Episode ${nextEpisode.episode} on ZyniVerse
URL:https://zyverse.in/anime/${animeId}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  };

  const generateGoogleCalendarUrl = () => {
    if (!nextEpisode) return "";
    
    const startDate = new Date(nextEpisode.airDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    
    const formatGoogleDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${title} - Episode ${nextEpisode.episode}`,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: `Watch ${title} Episode ${nextEpisode.episode} on ZyniVerse`,
      location: `https://zyverse.in/anime/${animeId}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateAppleCalendarUrl = () => {
    if (!nextEpisode) return "";
    
    const startDate = new Date(nextEpisode.airDate);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    
    const formatAppleDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const params = new URLSearchParams({
      begin: formatAppleDate(startDate),
      end: formatAppleDate(endDate),
      title: `${title} - Episode ${nextEpisode.episode}`,
      notes: `Watch ${title} Episode ${nextEpisode.episode} on ZyniVerse`,
      url: `https://zyverse.in/anime/${animeId}`,
    });

    return `webcal://zyverse.in/api/calendar?${params.toString()}`;
  };

  const handleDownloadICal = () => {
    const ical = generateICalEvent();
    const blob = new Blob([ical], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_episode_${nextEpisode?.episode || 1}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSynced(true);
  };

  if (!nextEpisode) {
    return (
      <div className={`rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 ${className}`}>
        <p className="text-sm text-[var(--color-mute)]">No upcoming episode scheduled.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">Calendar Sync</h3>
        {synced && (
          <span className="text-xs text-green-400">✓ Synced!</span>
        )}
      </div>
      
      <div className="mb-3 rounded-lg bg-[var(--color-surface2)] p-3">
        <p className="text-xs text-[var(--color-mute)]">Next Episode</p>
        <p className="text-sm font-medium">Episode {nextEpisode.episode}</p>
        <p className="text-xs text-[var(--color-mute)]">
          {new Date(nextEpisode.airDate).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {nextEpisode.timeUntil && (
          <p className="text-xs text-[var(--color-cyan)]">{nextEpisode.timeUntil}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={generateGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setSynced(true)}
          className="flex-1 rounded-lg bg-blue-500/20 px-3 py-2 text-center text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
        >
          Google Calendar
        </a>
        <a
          href={generateAppleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setSynced(true)}
          className="flex-1 rounded-lg bg-purple-500/20 px-3 py-2 text-center text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/30"
        >
          Apple Calendar
        </a>
        <button
          onClick={handleDownloadICal}
          className="flex-1 rounded-lg bg-green-500/20 px-3 py-2 text-center text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
        >
          Download .ics
        </button>
      </div>

      <p className="mt-3 text-[10px] text-[var(--color-mute)]">
        Add this anime to your calendar to never miss an episode!
      </p>
    </div>
  );
}
