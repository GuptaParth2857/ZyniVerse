"use client";

import { useState } from "react";

export default function ClubEventForm({
  clubId,
  onSubmit,
  onClose,
}: {
  clubId: string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title || !startTime || saving) return;
    setSaving(true);
    await fetch(`/api/clubs/${clubId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, startTime, endTime, isVirtual, streamUrl }),
    });
    setSaving(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#12111e] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Create Event</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full px-3 py-2 mb-3 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 mb-3 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none h-20 resize-none"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Start *</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">End</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isVirtual}
            onChange={(e) => setIsVirtual(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-white/60">Virtual event</span>
        </label>
        {isVirtual && (
          <input
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="Stream URL"
            className="w-full px-3 py-2 mb-3 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
          />
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs text-white/60 hover:text-white/80">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !startTime || saving}
            className="px-4 py-2 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-30"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
