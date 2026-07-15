"use client";

import { useEffect, useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

export default function ClubPostComments({
  clubId,
  postId,
}: {
  clubId: string;
  postId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/clubs/${clubId}/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [clubId, postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await fetch(`/api/clubs/${clubId}/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment("");
    fetchComments();
  };

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 bg-white/5 rounded" />
          ))}
        </div>
      ) : (
        <>
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] text-white/50">
                {c.user.username[0].toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-semibold text-white/70">{c.user.username}</span>
                <p className="text-xs text-white/50">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Write a comment..."
              className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
